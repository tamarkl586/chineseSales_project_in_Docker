using Microsoft.EntityFrameworkCore;
using project1.DAL.Interfaces;
using project1.DTOs.Cart;
using project1.Models;

namespace project1.DAL.Implementations
{
    public class CartDAL : ICartDAL
    {
        private readonly ProjectContext _context;
        public CartDAL(ProjectContext context)
            => _context = context;

        public async Task<List<Cart>> GetUserCartAsync(int userId)
            => await _context.Carts
                .Include(c => c.Gift)
                .Where(c => c.UserID == userId && !c.IsPurchased)
                .ToListAsync();

        public async Task<Cart?> GetByIdAsync(int id)
            => await _context.Carts
                .Include(c => c.Gift)
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Cart?> GetOpenCartItemAsync(int userId, int giftId)
            => await _context.Carts
                .FirstOrDefaultAsync(c => c.UserID == userId && c.GiftID == giftId && !c.IsPurchased);

        public async Task<List<Cart>> GetPurchasedByGiftAsync(int giftId)
            => await _context.Carts
                .Include(c => c.User)
                .Where(c => c.GiftID == giftId && c.IsPurchased)
                .ToListAsync();

        public async Task<List<Cart>> GetPurchasesByUserIdAsync(int userId)
            => await _context.Carts
                .Include(c => c.Gift)
                .Include(c => c.User)
                .Where(c => c.UserID == userId && c.IsPurchased)
                .ToListAsync();

        public async Task<List<Cart>> GetAllPurchasedItemsAsync()
            => await _context.Carts
                .AsNoTracking()
                .Include(c => c.User)
                .Include(c => c.Gift)
                .Where(c => c.IsPurchased)
                .ToListAsync();

        public async Task AddAsync(Cart cart)
        {
            await _context.Carts.AddAsync(cart);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Cart cart)
        {
            _context.Carts.Update(cart);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Cart cart)
        {
            _context.Carts.Remove(cart);
            await _context.SaveChangesAsync();
        }

        public async Task ExecutePurchaseAsync(int userId)
        {
            var items = await _context.Carts
                .Where(c => c.UserID == userId && !c.IsPurchased)
                .ToListAsync();

            items.ForEach(i => i.IsPurchased = true);

            await _context.SaveChangesAsync();
        }

        public async Task ClearUserCartAsync(int userId)
        {
            var items = await _context.Carts
                .Where(c => c.UserID == userId && !c.IsPurchased)
                .ToListAsync();

            _context.Carts.RemoveRange(items);

            await _context.SaveChangesAsync();
        }

        public IQueryable<Cart> GetSearchQuery()
            => _context.Carts
                .AsNoTracking()
                .Include(c => c.Gift)
                .Include(c => c.User);

        private IQueryable<TopGiftStatsDTO> BuildTopGiftQuery()
            => _context.Carts
                .AsNoTracking()
                .Where(c => c.IsPurchased)
                .GroupBy(c => new { c.GiftID, c.Gift!.Name, c.Gift.Price, c.Gift.Picture })
                .Select(g => new TopGiftStatsDTO
                {
                    GiftId = g.Key.GiftID,
                    GiftName = g.Key.Name,
                    Picture = g.Key.Picture,
                    Price = g.Key.Price,
                    TotalTicketsPurchased = g.Sum(x => x.Quantity),
                    TotalEarned = g.Sum(x => x.Quantity * x.Gift!.Price)
                });

        public async Task<TopGiftStatsDTO?> FindTopGiftAsync(string criteria)
        {
            var query = BuildTopGiftQuery();

            if (string.Equals(criteria, "tickets", StringComparison.OrdinalIgnoreCase))
            {
                query = query
                    .OrderByDescending(x => x.TotalTicketsPurchased)
                    .ThenByDescending(x => x.TotalEarned);
            }
            else if (string.Equals(criteria, "revenue", StringComparison.OrdinalIgnoreCase))
            {
                query = query
                    .OrderByDescending(x => x.TotalEarned)
                    .ThenByDescending(x => x.TotalTicketsPurchased);
            }

            return await query.FirstOrDefaultAsync();
        }
    }
}