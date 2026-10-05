package com.bourse.dashboard;

import java.net.URI;
import java.net.http.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import tools.jackson.databind.json.JsonMapper;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IranMarketApiTest {
 @LocalServerPort int port;

 @Test void servesIndicesAndCommodityFixturesWithExplicitUnits() throws Exception {
  for (String market : new String[]{"indices", "commodities"}) {
   var response = HttpClient.newHttpClient().send(
    HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/iran/" + market)).GET().build(),
    HttpResponse.BodyHandlers.ofString());
   assertThat(response.statusCode()).isEqualTo(200);
   assertThat(response.headers().firstValue("content-type").orElse("")).contains("application/json");
   var json = JsonMapper.builder().build().readTree(response.body());
   assertThat(json.get("demo").asBoolean()).isTrue();
   assertThat(json.get("source").asString()).isEqualTo("Demo fixtures");
   assertThat(json.get("updatedAt").asString()).isEqualTo("2026-10-05T08:00:00Z");
   var quotes = json.get("quotes");
   assertThat(quotes.size()).isEqualTo(market.equals("indices") ? 4 : 6);
   for (var quote : quotes) {
    assertThat(quote.get("value").isNumber()).isTrue();
    assertThat(quote.get("value").asDouble()).isPositive();
    assertThat(quote.get("changePercent").isNumber()).isTrue();
    assertThat(quote.get("unit").asString()).isIn(market.equals("indices") ? new String[]{"point"} : new String[]{"irr_kg", "irr_ton"});
   }
   assertThat(quotes.get(0).get("symbol").asString()).isEqualTo(market.equals("indices") ? "TEDPIX" : "STEEL");
  }
 }
}
