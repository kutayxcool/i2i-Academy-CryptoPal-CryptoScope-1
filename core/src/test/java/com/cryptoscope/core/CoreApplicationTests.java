package com.cryptoscope.core;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
		properties = {
				"app.market.scheduling.enabled=false"  //şimdilik çalışmaması daha iyi
		}
)
class CoreApplicationTests {

	@Test
	void contextLoads() {
	}
}