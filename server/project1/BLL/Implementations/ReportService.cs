using AutoMapper;
using Microsoft.EntityFrameworkCore;
using project1.BLL.Interfaces;
using project1.DAL;
using project1.DAL.Interfaces;
using project1.DTOs.Report;

namespace project1.BLL.Implementations
{
    public class ReportService : IReportService
    {
        private readonly IGiftDAL _giftDal;
        private readonly ICartDAL _cartDal;
        private readonly IMapper _mapper;
        private readonly ILogger<ReportService> _logger;

        public ReportService(IGiftDAL giftDal, ICartDAL cartDal, IMapper mapper, ILogger<ReportService> logger)
        {
            _giftDal = giftDal;
            _cartDal = cartDal;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<GiftWinnerReportDTO>> GetWinnersReportAsync()
        {
            _logger.LogDebug("Fetching only gifts with winners for report generation.");

            var gifts = await _giftDal.GetSearchQuery()
                .Where(g => g.WinnerId != null)
                .Include(g => g.Winner)
                .AsNoTracking()
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} gifts with winners for report.", gifts.Count);
            return _mapper.Map<List<GiftWinnerReportDTO>>(gifts);
        }

        public async Task<RevenueSummaryDTO> GetRevenueSummaryAsync()
        {
            _logger.LogDebug("Accessing purchase records to calculate total revenue.");

            var purchasedCarts = await _cartDal.GetSearchQuery()
                .Where(c => c.IsPurchased)
                .Include(c => c.Gift)
                .AsNoTracking()
                .ToListAsync();

            _logger.LogInformation("Revenue calculation completed for {Count} purchase records.", purchasedCarts.Count);
            return _mapper.Map<RevenueSummaryDTO>(purchasedCarts);
        }
    }
}
