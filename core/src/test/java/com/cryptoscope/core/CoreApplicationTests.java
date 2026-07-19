package com.cryptoscope.core;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
		properties = {
				"app.market.scheduling.enabled=false",
				"app.market.history.scheduling.enabled=false"
		}
)
class CoreApplicationTests {

	@Test
	void contextLoads() {
	}
}