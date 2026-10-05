package com.bourse.dashboard;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class MetalPriceController {
 private final MetalPriceService service;
 public MetalPriceController(MetalPriceService service) { this.service=service; }
 @GetMapping("/api/v1/metals/prices")
 public MetalPriceService.PriceResponse prices() { return service.prices(); }
}
