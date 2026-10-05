package com.bourse.dashboard;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import java.net.URI;
import java.net.http.*;
import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
class MetalPriceApiTest {
 @LocalServerPort int port;
 @Test void servesExplicitDemoQuotes() throws Exception {
  var response=HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/v1/metals/prices")).GET().build(),HttpResponse.BodyHandlers.ofString());
  assertThat(response.statusCode()).isEqualTo(200);
  assertThat(response.headers().firstValue("content-type").orElse("")).contains("application/json");
  assertThat(response.body()).contains("\"demo\":true","\"symbol\":\"XAU\"","troy_ounce","metric_ton","USD","طلا");
 }
}
