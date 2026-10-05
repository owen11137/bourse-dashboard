package com.bourse.dashboard;

import java.math.BigDecimal;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;

@Service
public class MetalPriceService {
 public record MetalPrice(String symbol, String name, String category, BigDecimal price, String currency, String unit, BigDecimal changePercent) {}
 public record PriceResponse(String source, boolean demo, Instant updatedAt, List<MetalPrice> metals) {}
 private final String key;
 private final String endpoint;
 private final HttpClient client;
 private String cached;
 private Instant expires = Instant.EPOCH;
 public MetalPriceService(@Value("${brsapi.key:}") String key,
   @Value("${brsapi.url:https://api.brsapi.ir/Market/Gold_Currency.php}") String endpoint) {
  this.key=key; this.endpoint=endpoint;
  var builder=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5));
  String proxy=System.getenv("HTTPS_PROXY");
  if (proxy==null) proxy=System.getenv("https_proxy");
  if (proxy!=null && endpoint.startsWith("https://")) {
   URI p=URI.create(proxy);
   builder.proxy(ProxySelector.of(new InetSocketAddress(p.getHost(),p.getPort()==-1?80:p.getPort())));
  }
  client=builder.build();
 }
 public PriceResponse prices() { return parse(fetch()); }
 public tools.jackson.databind.JsonNode markets() { return JsonMapper.builder().build().readTree(fetch()); }
 private synchronized String fetch() {
  if (key.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"کلید BrsAPI در سرور تنظیم نشده است.");
  if (cached!=null && Instant.now().isBefore(expires)) return cached;
  try {
   URI uri=URI.create(endpoint+"?key="+URLEncoder.encode(key,StandardCharsets.UTF_8));
   var request=HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(10)).GET().build();
   var response=client.send(request,HttpResponse.BodyHandlers.ofString());
   if (response.statusCode()!=200) throw new IllegalArgumentException("Upstream rejected request");
   var payload=JsonMapper.builder().build().readTree(response.body());
   for (String group:List.of("gold","currency","cryptocurrency")) {
    var rows=payload.get(group);
    if (rows==null || !rows.isArray()) throw new IllegalArgumentException("Missing market group");
    for (var q:rows) {
     if (q.path("symbol").asString().isBlank() || q.path("name").asString().isBlank() || q.path("unit").asString().isBlank()) throw new IllegalArgumentException("Invalid quote identity");
     if (new BigDecimal(q.path("price").asString()).signum()<=0 || Long.parseLong(q.path("time_unix").asString())<=0) throw new IllegalArgumentException("Invalid quote value");
     new BigDecimal(q.path("change_percent").asString());
     if (q.has("change_value")) new BigDecimal(q.path("change_value").asString());
     if (q.has("market_cap")) new BigDecimal(q.path("market_cap").asString());
    }
   }
   cached=response.body(); expires=Instant.now().plusSeconds(60);
   return cached;
  } catch (InterruptedException e) {
   Thread.currentThread().interrupt();
   throw unavailable();
  } catch (Exception e) {
   // Never expose the upstream URI, response body, or API key in errors.
   throw unavailable();
  }
 }
 private ResponseStatusException unavailable() {
  return new ResponseStatusException(HttpStatus.BAD_GATEWAY,"دریافت قیمت معتبر از BrsAPI انجام نشد.");
 }
 static PriceResponse parse(String body) {
  var root=JsonMapper.builder().build().readTree(body);
  var gold=root.get("gold");
  if (gold==null || !gold.isArray()) throw new IllegalArgumentException("Missing gold quotes");
  for (var q:gold) {
   if (!"XAUUSD".equals(q.path("symbol").asString())) continue;
   if (!"دلار".equals(q.path("unit").asString())) throw new IllegalArgumentException("Unexpected currency");
   var price=new BigDecimal(q.path("price").asString());
   var change=new BigDecimal(q.path("change_percent").asString());
   long timestamp=Long.parseLong(q.path("time_unix").asString());
   if (price.signum()<=0 || timestamp<=0) throw new IllegalArgumentException("Invalid quote");
   return new PriceResponse("BrsAPI",false,Instant.ofEpochSecond(timestamp),List.of(
    new MetalPrice("XAU","طلا","precious",price,"USD","troy_ounce",change)));
  }
  throw new IllegalArgumentException("Missing XAUUSD quote");
 }
}
