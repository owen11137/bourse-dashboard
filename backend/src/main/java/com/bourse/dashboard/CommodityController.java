package com.bourse.dashboard;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;

@RestController
public class CommodityController {
 private final MetalPriceService service;
 public CommodityController(@Value("${brsapi.key:}") String key,
  @Value("${brsapi.commodity-url:https://api.brsapi.ir/Market/Commodity.php}") String endpoint) {
  service=new MetalPriceService(key,endpoint,List.of("metal_precious","metal_base","energy"));
 }
 @GetMapping("/api/v1/markets/commodity")
 public JsonNode prices() { return service.markets(); }
}
