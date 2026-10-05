package com.bourse.dashboard;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IranMarketController {
 public record Quote(String symbol, String name, String category, BigDecimal value, String unit, BigDecimal changePercent) {}
 public record MarketResponse(String source, boolean demo, Instant updatedAt, List<Quote> quotes) {}

 @GetMapping("/api/v1/iran/indices")
 public MarketResponse indices() {
  return response(List.of(
   quote("TEDPIX", "شاخص کل بورس", "بورس تهران", "2150000", "point", "0.75"),
   quote("TEPIX-EW", "شاخص کل هم‌وزن", "بورس تهران", "720000", "point", "-0.32"),
   quote("IFX", "شاخص کل فرابورس", "فرابورس", "23500", "point", "0.48"),
   quote("TOP30", "شاخص ۳۰ شرکت بزرگ", "بورس تهران", "125000", "point", "1.12")
  ));
 }

 @GetMapping("/api/v1/iran/commodities")
 public MarketResponse commodities() {
  return response(List.of(
   quote("STEEL", "شمش فولاد", "فلزات", "280000", "irr_kg", "0.65"),
   quote("COPPER", "مس کاتد", "فلزات", "6800000", "irr_kg", "1.20"),
   quote("ALUMINIUM", "شمش آلومینیوم", "فلزات", "1850000", "irr_kg", "-0.45"),
   quote("CEMENT", "سیمان تیپ ۲", "معدنی", "12500000", "irr_ton", "0.25"),
   quote("BITUMEN", "قیر ۶۰/۷۰", "نفتی", "180000000", "irr_ton", "-0.80"),
   quote("POLYETHYLENE", "پلی‌اتیلن سنگین", "پتروشیمی", "650000", "irr_kg", "0.90")
  ));
 }

 private MarketResponse response(List<Quote> quotes) {
  return new MarketResponse("Demo fixtures", true, Instant.parse("2026-10-05T08:00:00Z"), quotes);
 }
 private Quote quote(String symbol, String name, String category, String value, String unit, String change) {
  return new Quote(symbol, name, category, new BigDecimal(value), unit, new BigDecimal(change));
 }
}
