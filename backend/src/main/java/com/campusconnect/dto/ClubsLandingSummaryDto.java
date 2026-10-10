package com.campusconnect.dto;

import java.util.List;
import java.util.Map;

public record ClubsLandingSummaryDto(
    List<CampusEventSummaryDto> featuredEvents,
    List<CampusEventSummaryDto> upcomingThisWeek,
    List<ClubSummaryDto> popularClubs,
    Map<String, Long> categoryEventCounts,
    Map<String, Long> categoryClubCounts,
    long totalClubs,
    long totalUpcomingEvents
) {}
