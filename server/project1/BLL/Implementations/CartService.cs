using AutoMapper;
using project1.BLL.Interfaces;
using project1.DAL.Interfaces;
using project1.DTOs.Cart;
using project1.Models;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Collections.Generic;

namespace project1.BLL.Implementations
{
    public class CartService : ICartService
    {
        private readonly ICartDAL _cartDal;
        private readonly IGiftDAL _giftDal;
        private readonly IMapper _mapper;
        private readonly ILogger<CartService> _logger;

        public CartService(ICartDAL cartDal, IGiftDAL giftDal, IMapper mapper, ILogger<CartService> logger)
        {
            _cartDal = cartDal;
            _giftDal = giftDal;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<CartItemDTO>> GetMyCartAsync(int userId)
        {
            _logger.LogDebug("Retrieving cart records from DAL for User {UserId}", userId);
            var items = await _cartDal.GetUserCartAsync(userId);
            return _mapper.Map<List<CartItemDTO>>(items);
        }

        public async Task<GiftPurchasesSummaryDTO> GetPurchasesByGiftIdAsync(int giftId)
        {
            _logger.LogInformation("Manager requested purchase history for Gift ID {GiftId}", giftId);

            var gift = await _giftDal.GetByIdAsync(giftId);
            if (gift == null)
            {
                _logger.LogWarning("Purchase history request failed: Gift ID {GiftId} not found.", giftId);
                throw new KeyNotFoundException("Gift not found in the system.");
            }

            var purchases = await _cartDal.GetPurchasedByGiftAsync(giftId);

            if (purchases == null || !purchases.Any())
            {
                _logger.LogInformation("No purchases found for Gift ID {GiftId}.", giftId);
                return _mapper.Map<GiftPurchasesSummaryDTO>(new List<Cart>());
            }

            _logger.LogInformation("Retrieved {Count} purchase records for Gift ID {GiftId}.", purchases.Count, giftId);

            var summary = _mapper.Map<GiftPurchasesSummaryDTO>(purchases);
            _logger.LogDebug("Built GiftPurchasesSummary for Gift ID {GiftId}: Tickets={Tickets}, Earned={Earned}", giftId, summary.TotalTicketsPurchased, summary.TotalEarned);
            return summary;
        }
        
        public async Task AddAsync(int userId, AddToCartDTO dto)
        {
            _logger.LogInformation("Checking availability for Gift ID {GiftId}", dto.GiftId);
            var gift = await _giftDal.GetByIdAsync(dto.GiftId!.Value)
                       ?? throw new KeyNotFoundException($"Gift ID {dto.GiftId} not found.");

            if(gift.WinnerId != null)
                throw new InvalidOperationException("A draw has already been performed for this gift.");

            var existingItem = await _cartDal.GetOpenCartItemAsync(userId, dto.GiftId.Value);

            if (existingItem != null)
            {
                _logger.LogInformation("Cart Item exists for User {UserId} and Gift {GiftId}. Incrementing quantity by {Qty}", userId, dto.GiftId, dto.Quantity);
                existingItem.Quantity += dto.Quantity;
                await _cartDal.UpdateAsync(existingItem);
            }
            else
            {
                _logger.LogInformation("Creating new cart entry for User {UserId} and Gift {GiftId}", userId, dto.GiftId);
                var cartItem = _mapper.Map<Cart>(dto);
                cartItem.UserID = userId;
                cartItem.CreatedAt = DateTime.Now;
                await _cartDal.AddAsync(cartItem);
            }
        }

        public async Task UpdateQuantityAsync(int cartId, int userId, int newQuantity)
        {
            if (newQuantity <= 0)
            {
                _logger.LogWarning("Invalid quantity update attempt: {Qty}", newQuantity);
                throw new InvalidOperationException("Quantity must be greater than zero.");
            }

            var item = await _cartDal.GetByIdAsync(cartId)
                       ?? throw new KeyNotFoundException("Cart item not found.");

            if (item.UserID != userId)
            {
                _logger.LogCritical("Security Warning: User {UserId} tried to modify Cart Item {CartId} belonging to another user!", userId, cartId);
                throw new UnauthorizedAccessException("You are not authorized to modify this cart item.");
            }

            item.Quantity = newQuantity;
            await _cartDal.UpdateAsync(item);
            _logger.LogInformation("Cart Item {CartId} quantity updated to {Qty}", cartId, newQuantity);
        }

        public async Task RemoveAsync(int cartId, int userId)
        {
            var item = await _cartDal.GetByIdAsync(cartId) ?? throw new KeyNotFoundException("Cart item not found in cart.");

            if (item.UserID != userId)
            {
                _logger.LogCritical("Security Warning: User {UserId} tried to delete Cart Item {CartId} belonging to another user!", userId, cartId);
                throw new UnauthorizedAccessException("You are not authorized to perform this action.");
            }

            if (item.IsPurchased)
            {
                _logger.LogWarning("Delete rejected: Cart Item {CartId} is already purchased.", cartId);
                throw new InvalidOperationException("Cannot remove an item that has already been purchased.");
            }

            await _cartDal.DeleteAsync(item);
            _logger.LogInformation("Cart Item {CartId} successfully removed.", cartId);
        }

        public async Task PurchaseAsync(int userId)
        {
            _logger.LogInformation("Starting purchase transaction for User {UserId}", userId);
            var items = await _cartDal.GetUserCartAsync(userId);

            if (!items.Any())
            {
                _logger.LogWarning("Purchase failed: User {UserId} has an empty cart.", userId);
                throw new InvalidOperationException("Cart is empty.");
            }

            // Filter out gifts that have already been drawn
            var drawnItems = items.Where(i => i.Gift != null && i.Gift.WinnerId != null).ToList();
            var validItems = items.Where(i => i.Gift == null || i.Gift.WinnerId == null).ToList();

            // Remove drawn items from cart automatically
            if (drawnItems.Any())
            {
                _logger.LogInformation("Removing {Count} drawn gift(s) from cart for User {UserId}", drawnItems.Count, userId);
                foreach (var drawnItem in drawnItems)
                {
                    await _cartDal.DeleteAsync(drawnItem);
                }
            }

            if (!validItems.Any())
            {
                _logger.LogWarning("Purchase failed: All items in cart for User {UserId} have already been drawn.", userId);
                throw new InvalidOperationException("כל הפריטים בסל כבר הוגרלו והוסרו. לא ניתן לבצע רכישה.");
            }

            await _cartDal.ExecutePurchaseAsync(userId);
            _logger.LogInformation("Transaction finalized for User {UserId}. {Valid} items purchased, {Drawn} drawn items removed.", userId, validItems.Count, drawnItems.Count);
        }

        public async Task ClearCartAsync(int userId)
        {
            _logger.LogInformation("Executing bulk delete (clear cart) for User {UserId}", userId);
            await _cartDal.ClearUserCartAsync(userId);
        }

        public async Task<List<PurchaserDetailsDTO>> GetAllPurchasersAsync()
        {
            _logger.LogInformation("Fetching all purchased cart items for purchasers report.");
            var allItems = await _cartDal.GetAllPurchasedItemsAsync();

            _logger.LogDebug("Grouping {Count} items by user for purchasers report.", allItems.Count);

            var result = allItems
                .GroupBy(i => i.UserID)
                .Select(group => MapToPurchaserDetails(group.ToList()))
                .ToList();

            _logger.LogInformation("Built purchasers report for {Count} distinct users.", result.Count);

            return result;
        }

        public async Task<TopGiftsDTO?> FindTopGiftAsync(string criteria)
        {
            if (string.IsNullOrWhiteSpace(criteria))
                throw new ArgumentException("A valid search type must be provided.", nameof(criteria));

            var normalized = criteria.Trim().ToLowerInvariant();
            if (normalized != "tickets" && normalized != "revenue")
                throw new ArgumentException("Invalid search value. Only 'tickets' or 'revenue' are allowed.", nameof(criteria));

            _logger.LogInformation("Admin requested top gift by criteria {Criteria}", normalized);

            var stat = await _cartDal.FindTopGiftAsync(normalized);

            if (stat == null)
            {
                _logger.LogInformation("No purchases found when searching top gift by criteria {Criteria}", normalized);
                return null;
            }

            var dto = _mapper.Map<TopGiftsDTO>(stat);

            // Fetch Gift entity to get winner info
            var gift = await _giftDal.GetByIdAsync(stat.GiftId);
            if (gift?.Winner != null)
            {
                dto.WinnerName = gift.Winner.Name;
            }

            return dto;
        }

        public async Task<PurchaserDetailsDTO> GetPurchaserDetailsAsync(int userId)
        {
            var items = await _cartDal.GetPurchasesByUserIdAsync(userId);

            if (!items.Any()) 
                throw new KeyNotFoundException("No purchases were found for this user.");

            return MapToPurchaserDetails(items);
        }

        private PurchaserDetailsDTO MapToPurchaserDetails(List<Cart> items)
        {
            var user = items.First().User;
            var dto = _mapper.Map<PurchaserDetailsDTO>(user);
            dto.PurchaseHistory = _mapper.Map<List<PurchaserItemDTO>>(items);
            dto.TotalTicketsPurchased = dto.PurchaseHistory.Sum(x => x.Quantity);
            dto.GrandTotalSpent = dto.PurchaseHistory.Sum(x => x.TotalPrice);
            return dto;
        }
    }
}