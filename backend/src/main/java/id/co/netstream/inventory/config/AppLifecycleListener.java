package id.co.netstream.inventory.config;

import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.jboss.logging.Logger;

/**
 * Application Lifecycle Listener that monitors startup and graceful shutdown
 * for the Netstream Telecom Inventory Service.
 */
@ApplicationScoped
public class AppLifecycleListener {

    private static final Logger LOG = Logger.getLogger(AppLifecycleListener.class);

    void onStart(@Observes StartupEvent ev) {
        LOG.info(">>> Netstream Telecom Inventory Service initialized successfully. Ready to accept traffic.");
    }

    void onStop(@Observes ShutdownEvent ev) {
        LOG.info(">>> Netstream Telecom Inventory Service shutdown signal received. Gracefully draining in-flight requests and closing resources...");
    }
}
