package com.banyan.lab.sdrs.support;

import com.banyan.lab.sdrs.entity.CareerLevel;
import com.banyan.lab.sdrs.entity.EmploymentType;
import com.banyan.lab.sdrs.entity.Job;
import com.banyan.lab.sdrs.entity.JobStatus;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Project;
import com.banyan.lab.sdrs.entity.ProjectLocation;
import com.banyan.lab.sdrs.entity.Service;
import com.banyan.lab.sdrs.entity.ServiceCategory;
import com.banyan.lab.sdrs.entity.Stat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * One market, service, project and job, taken from {@code packages/shared/data}
 * as {@link NewsTestData} is, so the assertions run against real content.
 */
public final class CollectionTestData {

    private CollectionTestData() {}

    public static final String MARKET_SLUG = "buildings";
    public static final String SERVICE_SLUG = "structural-engineering";
    public static final String PROJECT_SLUG = "elizabeth-line";
    public static final long JOB_ID = 1L;

    public static Market market() {
        return market(MARKET_SLUG, "Buildings");
    }

    public static Market market(String slug, String name) {
        Market market = new Market();
        market.setSlug(slug);
        market.setName(name);
        market.setTagline("Buildings that earn their carbon and hold their value");
        market.setDescription("Offices, homes, mixed-use districts, campuses, venues and retrofit.");
        market.setFilmUrl("/video/markets/buildings.webm");
        market.setCapabilities(new ArrayList<>(List.of(
                "Structural and façade engineering", "Building services and MEP design")));
        market.setStats(new ArrayList<>(List.of(
                stat("45", "%", "Average embodied carbon saving on reuse schemes"),
                stat("900", null, "Certified sustainable buildings delivered"))));
        return market;
    }

    public static Service service() {
        Service service = new Service();
        service.setSlug(SERVICE_SLUG);
        service.setName("Structural Engineering");
        service.setCategory(ServiceCategory.DESIGN_AND_ENGINEERING);
        service.setTagline("Frames that stand up to height, wind and the ground they sit on");
        service.setDescription("Tall and supertall buildings, long spans and lateral systems.");
        service.setImageUrl(null);
        service.setCapabilities(new ArrayList<>(List.of("Tall and supertall buildings")));
        service.setRelatedMarkets(new ArrayList<>(List.of(market())));
        return service;
    }

    public static Project project() {
        ProjectLocation location = new ProjectLocation();
        location.setCity("London");
        location.setCountry("United Kingdom");

        Project project = new Project();
        project.setSlug(PROJECT_SLUG);
        project.setTitle("Crossrail / Elizabeth line");
        project.setLocation(location);
        project.setYear(2022);
        project.setClient("Crossrail Limited");
        project.setSummary("London's newest cross-city railway.");
        project.setDescription("We worked on the Elizabeth line for over two decades.");
        project.setImageUrl("https://sdrs-media.s3.amazonaws.com/projects/elizabeth-line.jpg");
        project.setStats(new ArrayList<>(List.of(stat("10", null, "New stations designed"))));
        project.setHighlights(new ArrayList<>(List.of(
                "Station designs coordinated across ten separate delivery contracts")));
        project.setMarkets(new ArrayList<>(List.of(market())));
        project.setServices(new ArrayList<>(List.of(service())));
        return project;
    }

    public static Job job() {
        Job job = new Job();
        job.setId(JOB_ID);
        job.setTitle("Senior Structural Engineer — Tall Buildings");
        job.setDiscipline("Structural engineering");
        job.setLocation("London, United Kingdom");
        job.setEmploymentType(EmploymentType.FULL_TIME);
        job.setLevel(CareerLevel.SENIOR);
        job.setStatus(JobStatus.OPEN);
        job.setPostedAt(LocalDate.of(2026, 9, 12));
        job.setDeadline(null);
        return job;
    }

    private static Stat stat(String value, String unit, String label) {
        Stat stat = new Stat();
        stat.setValue(value);
        stat.setUnit(unit);
        stat.setLabel(label);
        return stat;
    }
}
