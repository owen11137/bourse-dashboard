package com.bourse.dashboard;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
@Service
public class MetalPriceService {
 public record MetalPrice(String symbol, String name, String category, BigDecimal price, String currency, String unit, BigDecimal changePercent) {}
 public record PriceResponse(String source, boolean demo, Instant updatedAt, List<MetalPrice> metals) {}
 // Fixed fixture timestamp: refreshing never pretends these are fresh market quotes.
 public PriceResponse prices() {
  return new PriceResponse("Demo fixtures", true, Instant.parse("2026-10-05T08:00:00Z"), List.of(
   metal("XAU","طلا","precious","2650.40","troy_ounce","0.82"),
   metal("XAG","نقره","precious","31.25","troy_ounce","1.34"),
   metal("XPT","پلاتین","precious","980.60","troy_ounce","-0.45"),
   metal("XPD","پالادیوم","precious","1050.20","troy_ounce","0.27"),
   metal("CU","مس","industrial","9450.00","metric_ton","1.12"),
   metal("AL","آلومینیوم","industrial","2580.50","metric_ton","-0.32"),
   metal("ZN","روی","industrial","3025.00","metric_ton","0.65"),
   metal("NI","نیکل","industrial","16840.00","metric_ton","-1.08")
  ));
 }
 private MetalPrice metal(String symbol,String name,String category,String price,String unit,String change) {
  return new MetalPrice(symbol,name,category,new BigDecimal(price),"USD",unit,new BigDecimal(change));
 }
}
