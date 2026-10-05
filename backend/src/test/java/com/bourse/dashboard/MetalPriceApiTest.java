package com.bourse.dashboard;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import static org.assertj.core.api.Assertions.*;
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
class MetalPriceApiTest {
 @LocalServerPort int port;
 static final AtomicInteger calls=new AtomicInteger();
 static final String fixture;
 static final HttpServer upstream;
 static {
  try {
   fixture=new String(MetalPriceApiTest.class.getResourceAsStream("/brsapi-gold.json").readAllBytes(),StandardCharsets.UTF_8);
   upstream=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
   upstream.createContext("/prices",exchange->{
    calls.incrementAndGet();
    if (!"key=test-key".equals(exchange.getRequestURI().getRawQuery())) {
     exchange.sendResponseHeaders(401,-1);exchange.close();return;
    }
    byte[] bytes=fixture.getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().set("Content-Type","application/json");
    exchange.sendResponseHeaders(200,bytes.length);
    exchange.getResponseBody().write(bytes);exchange.close();
   });upstream.start();
  } catch(Exception e) {throw new ExceptionInInitializerError(e);}
 }
 @DynamicPropertySource static void properties(DynamicPropertyRegistry r) {
  r.add("brsapi.key",()->"test-key");
  r.add("brsapi.url",()->"http://127.0.0.1:"+upstream.getAddress().getPort()+"/prices");
 }
 @org.junit.jupiter.api.AfterAll static void stop(){upstream.stop(0);}
 @Test void mapsProviderQuoteAndCachesUpstreamRequests() throws Exception {
  int before=calls.get();
  var client=HttpClient.newHttpClient();
  var request=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/v1/metals/prices")).GET().build();
  var response=client.send(request,HttpResponse.BodyHandlers.ofString());
  assertThat(response.statusCode()).isEqualTo(200);
  assertThat(response.body()).contains("\"demo\":false","BrsAPI","\"price\":4156","\"changePercent\":0.39","troy_ounce","USD").doesNotContain("IR_COIN","test-key","XAG");
  assertThat(client.send(request,HttpResponse.BodyHandlers.ofString()).body()).isEqualTo(response.body());
  assertThat(calls.get()-before).isEqualTo(1);
  var parsed=MetalPriceService.parse(fixture);
  assertThat(parsed.updatedAt()).isEqualTo(Instant.ofEpochSecond(1791204856));
  assertThat(parsed.metals()).hasSize(1);
 }
 @Test void rejectsMissingOrInvalidGoldRatherThanInventingPrices() {
  assertThatThrownBy(()->MetalPriceService.parse("{\"gold\":[]}")).isInstanceOf(IllegalArgumentException.class);
  assertThatThrownBy(()->MetalPriceService.parse(fixture.replace("4156","-1"))).isInstanceOf(IllegalArgumentException.class);
  assertThatThrownBy(()->MetalPriceService.parse(fixture.replace("دلار","تومان"))).isInstanceOf(IllegalArgumentException.class);
 }
 @Test void reportsMissingKeyAndRedactsUpstreamFailures() {
  assertThatThrownBy(()->new MetalPriceService("","http://127.0.0.1").prices()).isInstanceOf(org.springframework.web.server.ResponseStatusException.class).hasMessageContaining("503");
  assertThatThrownBy(()->new MetalPriceService("private-test-key","http://127.0.0.1:"+upstream.getAddress().getPort()+"/prices").prices())
   .isInstanceOf(org.springframework.web.server.ResponseStatusException.class).hasMessageContaining("502").hasMessageNotContaining("private-test-key");
 }
}
