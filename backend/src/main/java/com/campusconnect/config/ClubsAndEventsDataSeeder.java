package com.campusconnect.config;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.entity.CampusEvent;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.ClubCategory;
import com.campusconnect.entity.EventCategory;
import com.campusconnect.entity.EventStatus;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.repository.CampusEventRepository;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.UserRepository;

@Component
@Order(10)
public class ClubsAndEventsDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ClubsAndEventsDataSeeder.class);

    private final ClubRepository clubRepo;
    private final CampusEventRepository eventRepo;
    private final UserRepository userRepo;

    public ClubsAndEventsDataSeeder(ClubRepository clubRepo,
                                    CampusEventRepository eventRepo,
                                    UserRepository userRepo) {
        this.clubRepo = clubRepo;
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (clubRepo.count() > 0) {
            log.info("Clubs directory already initialized ({} clubs found). Skipping seed.", clubRepo.count());
            return;
        }

        log.info("Seeding initial authentic college clubs directory and sample campus events...");

        User adminUser = userRepo.findByRole(Role.ADMIN).stream().findFirst().orElse(null);
        if (adminUser == null) {
            adminUser = userRepo.findAll().stream().findFirst().orElse(null);
        }
        if (adminUser == null) {
            log.warn("No user found to assign as default seeder organizer. Skipping clubs/events seed.");
            return;
        }

        // ── 1. Seed Clubs ────────────────────────────────────────────────────────
        List<Club> clubs = List.of(
            // Technical
            createClub("Arya Cipher Coding Club", "arya-cipher-coding-club", ClubCategory.TECHNICAL,
                "Algorithmic challenges, competitive programming, and open-source software.",
                "The premier competitive programming hub at Arya. We host weekly algorithmic problem-solving circles, LeetCode sprints, and prepare student teams for ICPC and international coding challenges.",
                "• Weekly LeetCode & Codeforces contests\n• Dynamic Programming and Graph Theory masterclasses\n• Open-source contribution drives\n• Annual Speed Coding Championship",
                adminUser),

            createClub("Arya GDG Club", "arya-gdg-club", ClubCategory.TECHNICAL,
                "Google Developer Groups on campus — Android, Cloud, Web, and AI.",
                "Official student community for Google technologies. Students learn modern full-stack web architectures, Firebase, Android Jetpack Compose, and Google Cloud platform tools through hands-on hack nights.",
                "• Google Cloud study jams\n• Flutter & Android app development hackathons\n• Google Solution Challenge mentorship\n• Guest tech talks with industry engineers",
                adminUser),

            createClub("Arya Hackathon Club", "arya-hackathon-club", ClubCategory.TECHNICAL,
                "Rapid prototyping, 24-hour hackathons, and product incubation.",
                "A fast-paced environment for builders and designers who turn wild ideas into working MVPs. We organize pre-hackathon bootcamps and sponsor teams to national hackathons including Smart India Hackathon.",
                "• Monthly internal 24-hour hack sprints\n• Pitch decks and product design workshops\n• Cloud credits and hardware kit lending\n• SIH preparation and mentorship",
                adminUser),

            createClub("Arya Robotics Club", "arya-robotics-club", ClubCategory.TECHNICAL,
                "Autonomous rovers, Arduino/Raspberry Pi robotics, and combat bots.",
                "Where mechanical engineering meets embedded systems. Students design micro-controller circuits, 3D-print chassis, and build line followers, maze solvers, and competitive combat robots for tech festivals.",
                "• Arduino & ESP32 microcontroller labs\n• ROS (Robot Operating System) simulation\n• Robo Soccer and Robo Race competitions\n• Drone fabrication fundamentals",
                adminUser),

            createClub("Arya Drones Club", "arya-drones-club", ClubCategory.TECHNICAL,
                "UAV aerodynamics, FPV quadcopters, and aerial payload telemetry.",
                "Focused on uncrewed aerial systems. Members learn multi-rotor flight dynamics, FPV camera telemetry, GPS navigation modules, and drone assembly under safety guidelines.",
                "• Drone hardware assembly and motor tuning\n• FPV obstacle course flight training\n• Aerial surveying and mapping demos\n• Drone photography collaborations",
                adminUser),

            createClub("Arya Automation Club", "arya-automation-club", ClubCategory.TECHNICAL,
                "Industrial PLC programming, IoT telemetry, and smart campus solutions.",
                "Connecting hardware sensors to cloud dashboards. We explore industrial automation, smart micro-grids, and edge IoT devices.",
                "• PLC and SCADA automation fundamentals\n• Smart campus sensor mesh prototypes\n• Home automation mini-projects\n• Industrial site visit exposures",
                adminUser),

            // Cultural & Arts
            createClub("Arya Music Club", "arya-music-club", ClubCategory.CULTURAL,
                "Acoustic melodies, classical ragas, vocal harmonies, and rock bands.",
                "The musical heartbeat of CampusConnect. Bringing together vocalists, guitarists, drummers, and sound engineers for college festivals and cultural evenings.",
                "• Acoustic jam sessions in the college amphitheater\n• Annual Euphonious battle of the bands\n• Western and Hindustani classical vocal coaching\n• Music production & studio recording basics",
                adminUser),

            createClub("Arya Dance Club", "arya-dance-club", ClubCategory.CULTURAL,
                "Choreography, hip-hop, classical fusion, and western dance performances.",
                "Celebrating rhythm and expression. Our dance crews represent Arya at university dance festivals, state fests, and annual cultural celebrations.",
                "• Street dance, locking, and popping workshops\n• Classical Kathak and Bharatnatyam fusion\n• Annual dance fest choreography\n• Flash mob and campus event openers",
                adminUser),

            createClub("Arya Drama Club", "arya-drama-club", ClubCategory.CULTURAL,
                "Nukkad natak (street play), proscenium theater, and mono-acting.",
                "Storytelling that moves audiences and sparks social awareness. Our street play and stage production teams write original scripts that address contemporary campus and social issues.",
                "• Annual street play (Nukkad Natak) productions\n• Voice modulation and stage presence clinics\n• Scriptwriting & screenplay workshops\n• Inter-college theatre competition entries",
                adminUser),

            createClub("Arya PhotoSphere Club", "arya-photosphere-club", ClubCategory.CULTURAL,
                "Visual storytelling, DSLR framing, portraiture, and event coverage.",
                "Capturing the vibrant moments of college life. Members learn exposure triangles, composition, street photography, and post-processing Lightroom workflows.",
                "• Campus photowalks and heritage city shoots\n• Event media coverage and official gallery archiving\n• Portrait and lighting equipment tutorials\n• Annual 'Click the Campus' photo contest",
                adminUser),

            createClub("Arya Literature Club", "arya-literature-club", ClubCategory.CULTURAL,
                "Debates, poetry slams, book discussions, and creative writing.",
                "For bibliophiles, poets, and debaters. We host parliamentary debates, creative writing challenges, and publish the annual student literary magazine.",
                "• Bi-weekly poetry open-mics (Kavyanjali)\n• Parliamentary and Oxford-style debates\n• Creative short-story writing contests\n• Campus book exchanges and reviews",
                adminUser),

            // Sports
            createClub("Arya Cricket Club", "arya-cricket-club", ClubCategory.SPORTS,
                "Inter-departmental cricket leagues, turf net practice, and collegiate tournaments.",
                "The official home for cricket enthusiasts at Arya. Regular turf training, leather ball tournaments, and selection for the college championship team.",
                "• Weekly squad net practice sessions\n• Annual Arya Cup Cricket Tournament\n• Inter-department cricket matches\n• Tactical fielding and bowling drills",
                adminUser),

            createClub("Arya Football Club", "arya-football-club", ClubCategory.SPORTS,
                "11-a-side football, tactical drills, and inter-collegiate soccer tournaments.",
                "Discipline, stamina, and team spirit on the pitch. Regular morning training, tactical drills, and intra-college 7-a-side weekend cups.",
                "• Morning fitness and tactical formation drills\n• 7-a-side weekend tournament series\n• Annual Inter-College Football Summit\n• Friendly matches with visiting colleges",
                adminUser),

            createClub("Arya Chess Club", "arya-chess-club", ClubCategory.SPORTS,
                "Classical chess, Blitz challenges, tactical puzzles, and RTU tournaments.",
                "Where strategic minds sharpen their game. We analyze grandmaster games, solve endgame puzzles, and compete in rated blitz championships.",
                "• Weekly Swiss-system blitz chess tournaments\n• Endgame and positional strategy lectures\n• Simultaneous exhibitions (Simuls)\n• RTU inter-collegiate team trials",
                adminUser),

            createClub("Arya Basketball Club", "arya-basketball-club", ClubCategory.SPORTS,
                "Hardcourt drills, 3x3 tournaments, and collegiate basketball cups.",
                "Speed, precision, and court vision. Daily shooting practice, full-court scrimmages, and representation in state university basketball meets.",
                "• Daily shooting and layup drills\n• 3x3 half-court streetball showdowns\n• Annual Arya Basketball Trophy\n• Conditioning and jump training clinics",
                adminUser),

            createClub("Arya E-Sports Club", "arya-e-sports-club", ClubCategory.SPORTS,
                "Competitive gaming, collegiate LAN leagues, Valorant, and BGMI.",
                "Fostering strategic gaming and sportsmanship. We host campus LAN championships, streaming setups, and coordinate collegiate tournament participation.",
                "• Inter-department Valorant and CS championships\n• BGMI mobile tournament weekends\n• Game strategy, shoutcasting, and stream management\n• Responsible gaming and balance seminars",
                adminUser),

            // Social & Community
            createClub("Arya Social Activities Club", "arya-social-activities-club", ClubCategory.SOCIAL,
                "Community outreach, literacy programs, and campus social initiatives.",
                "Giving back to society through proactive student volunteering. Organizing regular blood donation camps, digital literacy in nearby schools, and festive drives.",
                "• Bi-annual campus voluntary blood donation camps\n• Digital literacy volunteer visits\n• Festive food and clothes donation drives\n• Mental wellness and peer counseling campaigns",
                adminUser),

            createClub("Arya Eco Warriors Club", "arya-eco-warriors-club", ClubCategory.SOCIAL,
                "Tree plantations, zero-waste campus initiatives, and solar awareness.",
                "Championing sustainability on campus. We audit energy consumption, plant native greenery, and manage campus recycling drives.",
                "• Campus tree plantation drives\n• Plastic-free campus campaigns and recycling bins\n• Solar energy workshops and green audit walks\n• World Environment Day eco-exhibitions",
                adminUser)
        );

        clubRepo.saveAll(clubs);
        log.info("Successfully seeded {} authentic college clubs.", clubs.size());

        // ── 2. Seed Events ───────────────────────────────────────────────────────
        Club codingClub = clubRepo.findBySlug("arya-cipher-coding-club").orElse(null);
        Club gdgClub = clubRepo.findBySlug("arya-gdg-club").orElse(null);
        Club roboClub = clubRepo.findBySlug("arya-robotics-club").orElse(null);
        Club musicClub = clubRepo.findBySlug("arya-music-club").orElse(null);
        Club dramaClub = clubRepo.findBySlug("arya-drama-club").orElse(null);
        Club cricketClub = clubRepo.findBySlug("arya-cricket-club").orElse(null);
        Club footballClub = clubRepo.findBySlug("arya-football-club").orElse(null);
        Club chessClub = clubRepo.findBySlug("arya-chess-club").orElse(null);

        LocalDateTime now = LocalDateTime.now();

        List<CampusEvent> events = List.of(
            // Featured Technical Event
            createEvent(
                "Projectathon 2.0 — Annual Engineering Prototype Expo",
                "projectathon-2-0-annual-engineering-prototype-expo",
                gdgClub,
                EventCategory.TECHNICAL,
                "The flagship multi-department engineering project exhibition. Student teams showcase working hardware and software prototypes, IoT devices, AI systems, and automated mechanical systems before an industry jury and venture mentors.",
                "Arya Campus Main Auditorium & Exhibition Hall",
                false,
                null,
                now.plusDays(12).withHour(9).withMinute(30),
                now.plusDays(12).withHour(17).withMinute(30),
                now.plusDays(10).withHour(23).withMinute(59),
                180,
                34,
                true,
                adminUser
            ),

            // Featured Cultural Event
            createEvent(
                "EUPHONIOUS 2026 — Annual Music Mania Fest",
                "euphonious-2026-annual-music-mania-fest",
                musicClub,
                EventCategory.CULTURAL,
                "Arya College's landmark musical festival. Featuring acoustic solo vocal competitions, rock band wars, classical fusion ensembles, and an evening celebrity guest performance under the campus stars.",
                "College Amphitheatre & Central Open Lawns",
                false,
                null,
                now.plusDays(18).withHour(16).withMinute(0),
                now.plusDays(18).withHour(22).withMinute(0),
                now.plusDays(16).withHour(20).withMinute(0),
                450,
                112,
                true,
                adminUser
            ),

            // Featured Sports Event
            createEvent(
                "The Rural Sports Competition 2026 — Athletic Summit",
                "the-rural-sports-competition-2026-athletic-summit",
                cricketClub,
                EventCategory.SPORTS,
                "A grand campus sports spectacle featuring sprint races, tug-of-war, gully cricket, kabaddi matches, and traditional field athletics celebrating fitness, teamwork, and high spirits.",
                "Arya Sports Complex Ground",
                false,
                null,
                now.plusDays(5).withHour(8).withMinute(0),
                now.plusDays(5).withHour(18).withMinute(0),
                now.plusDays(4).withHour(22).withMinute(0),
                300,
                88,
                true,
                adminUser
            ),

            // Upcoming This Week Events
            createEvent(
                "Roboleague 2026 — Autonomous Obstacle Course & Bot Soccer",
                "roboleague-2026-autonomous-obstacle-course",
                roboClub,
                EventCategory.TECHNICAL,
                "Competitive robotics showdown where autonomous and radio-controlled bots navigate complex obstacle courses, climb ramps, and compete in the high-octane Robo Soccer league.",
                "Robotics Lab & Tech Arena, Block B",
                false,
                null,
                now.plusDays(3).withHour(10).withMinute(0),
                now.plusDays(3).withHour(16).withMinute(0),
                now.plusDays(2).withHour(23).withMinute(59),
                80,
                42,
                false,
                adminUser
            ),

            createEvent(
                "Zephyr Tech Summit — Cloud Architectures & Microservices",
                "zephyr-tech-summit-cloud-architectures",
                codingClub,
                EventCategory.TECHNICAL,
                "Deep-dive technical workshop on high-throughput microservices, Docker containerization, Kubernetes orchestration, and event-driven architectures with live production deployment demos.",
                "Online via Google Meet",
                true,
                "https://meet.google.com/cc-zephyr-2026",
                now.plusDays(2).withHour(14).withMinute(0),
                now.plusDays(2).withHour(17).withMinute(0),
                now.plusDays(2).withHour(12).withMinute(0),
                150,
                65,
                false,
                adminUser
            ),

            createEvent(
                "Music Mania Antakshari-24 & Acoustic Jam",
                "music-mania-antakshari-24-acoustic-jam",
                musicClub,
                EventCategory.CULTURAL,
                "Fast-paced team Antakshari competition featuring Bollywood, Western, and regional music rounds, followed by an open-mic acoustic guitar jam for all students.",
                "Auditorium Foyer & Stage 2",
                false,
                null,
                now.plusDays(4).withHour(15).withMinute(30),
                now.plusDays(4).withHour(18).withMinute(30),
                now.plusDays(3).withHour(23).withMinute(59),
                120,
                51,
                false,
                adminUser
            ),

            createEvent(
                "Arya Cup 2025 — Football Tournament Knockouts",
                "arya-cup-2025-football-tournament-knockouts",
                footballClub,
                EventCategory.SPORTS,
                "Intense 11-a-side knockout rounds between computer science, mechanical, electrical, and civil department football teams.",
                "Main College Football Stadium",
                false,
                null,
                now.plusDays(6).withHour(7).withMinute(30),
                now.plusDays(6).withHour(12).withMinute(30),
                now.plusDays(5).withHour(20).withMinute(0),
                200,
                94,
                false,
                adminUser
            ),

            createEvent(
                "Just a Minute (JAM) & Model Sketching Fest",
                "just-a-minute-jam-and-model-sketching-fest",
                dramaClub,
                EventCategory.CULTURAL,
                "Twin creative contest: Test impromptu speaking skills without hesitation, repetition, or deviation in JAM, followed by a live charcoal and pencil model sketching exhibition.",
                "Seminar Hall C & Art Studio",
                false,
                null,
                now.plusDays(8).withHour(11).withMinute(0),
                now.plusDays(8).withHour(15).withMinute(0),
                now.plusDays(7).withHour(18).withMinute(0),
                100,
                29,
                false,
                adminUser
            ),

            createEvent(
                "Arya Blitz Chess Championship 2026",
                "arya-blitz-chess-championship-2026",
                chessClub,
                EventCategory.SPORTS,
                "Rated 5-minute + 3-second increment Blitz tournament. 7 rounds of Swiss pairings. Trophies and certificates for top board finishers across men and women categories.",
                "Indoor Sports Arena, 2nd Floor",
                false,
                null,
                now.plusDays(10).withHour(13).withMinute(0),
                now.plusDays(10).withHour(18).withMinute(0),
                now.plusDays(9).withHour(23).withMinute(59),
                64,
                38,
                false,
                adminUser
            ),

            createEvent(
                "Annual Technical Research Paper Symposium",
                "annual-technical-research-paper-symposium",
                null,
                EventCategory.ACADEMIC,
                "Interdisciplinary student research symposium covering machine learning, renewable energy grids, smart materials, and computational linguistics. Faculty reviewers provide publication feedback.",
                "Arya Conference Center, Hall 1",
                false,
                null,
                now.plusDays(15).withHour(10).withMinute(0),
                now.plusDays(15).withHour(16).withMinute(30),
                now.plusDays(13).withHour(18).withMinute(0),
                120,
                27,
                false,
                adminUser
            ),

            // Past Completed Event (for Past Events view)
            createPastEvent(
                "Short Film Making & Photography Exhibition 2025",
                "short-film-making-and-photography-exhibition-2025",
                dramaClub,
                EventCategory.CULTURAL,
                "Screening of top 12 student short films produced during the 48-hour film challenge, alongside a gallery display of award-winning campus photographs.",
                "Arya Mini Theatre, Media Block",
                now.minusDays(20).withHour(14).withMinute(0),
                now.minusDays(20).withHour(18).withMinute(0),
                150,
                142,
                adminUser
            ),

            createPastEvent(
                "Hackathon — Smart Campus Solutions 2025",
                "hackathon-smart-campus-solutions-2025",
                codingClub,
                EventCategory.TECHNICAL,
                "36-hour hackathon focused on campus logistics, library automation, energy monitoring, and student welfare applications.",
                "Central Computer Center, Labs 1-4",
                now.minusDays(45).withHour(9).withMinute(0),
                now.minusDays(43).withHour(21).withMinute(0),
                200,
                198,
                adminUser
            )
        );

        eventRepo.saveAll(events);
        log.info("Successfully seeded {} campus events.", events.size());
    }

    private Club createClub(String name, String slug, ClubCategory category,
                            String tagline, String description, String activities, User lead) {
        Club club = new Club(name, slug, category, tagline, description);
        club.setActivities(activities);
        club.setLeadCoordinator(lead);
        club.setContactEmail(slug + "@campusconnect.edu");
        club.setActive(true);
        club.setSampleData(true);
        club.setMemberCount((int) (24 + (Math.abs(slug.hashCode()) % 45)));
        return club;
    }

    private CampusEvent createEvent(String title, String slug, Club club, EventCategory category,
                                    String description, String venue, boolean online, String meetingLink,
                                    LocalDateTime start, LocalDateTime end, LocalDateTime deadline,
                                    Integer capacity, int registeredCount, boolean featured, User organizer) {
        CampusEvent event = new CampusEvent();
        event.setTitle(title);
        event.setSlug(slug);
        event.setClub(club);
        event.setCategory(category);
        event.setDescription(description);
        event.setVenue(venue);
        event.setOnline(online);
        event.setMeetingLink(meetingLink);
        event.setStartDateTime(start);
        event.setEndDateTime(end);
        event.setRegistrationDeadline(deadline);
        event.setCapacity(capacity);
        event.setRegisteredCount(registeredCount);
        event.setStatus(EventStatus.PUBLISHED);
        event.setFeatured(featured);
        event.setSampleData(true);
        event.setOrganizer(organizer);
        return event;
    }

    private CampusEvent createPastEvent(String title, String slug, Club club, EventCategory category,
                                        String description, String venue,
                                        LocalDateTime start, LocalDateTime end,
                                        Integer capacity, int registeredCount, User organizer) {
        CampusEvent event = new CampusEvent();
        event.setTitle(title);
        event.setSlug(slug);
        event.setClub(club);
        event.setCategory(category);
        event.setDescription(description);
        event.setVenue(venue);
        event.setOnline(false);
        event.setStartDateTime(start);
        event.setEndDateTime(end);
        event.setRegistrationDeadline(start.minusDays(1));
        event.setCapacity(capacity);
        event.setRegisteredCount(registeredCount);
        event.setStatus(EventStatus.COMPLETED);
        event.setFeatured(false);
        event.setSampleData(true);
        event.setOrganizer(organizer);
        return event;
    }
}
