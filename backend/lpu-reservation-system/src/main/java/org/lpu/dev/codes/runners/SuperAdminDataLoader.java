package org.lpu.dev.codes.runners;



import org.lpu.dev.codes.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SuperAdminDataLoader implements CommandLineRunner {

    @Autowired
    private TestService testService;

    @Override
    public void run(String... args) {
        testService.createOtherAccount();
    	
    }
}
