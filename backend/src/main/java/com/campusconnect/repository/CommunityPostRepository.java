package com.campusconnect.repository;

import com.campusconnect.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    @Query("""
        SELECT p FROM CommunityPost p
        WHERE (:category IS NULL OR :category = 'all' OR LOWER(p.category) = LOWER(:category))
          AND (:query IS NULL OR :query = '' OR (
                LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(p.author.name) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(p.categoryLabel) LIKE LOWER(CONCAT('%', :query, '%'))
          ))
        ORDER BY p.upvotesCount DESC, p.createdAt DESC
    """)
    List<CommunityPost> findFilteredTrending(@Param("category") String category, @Param("query") String query);

    @Query("""
        SELECT p FROM CommunityPost p
        WHERE (:category IS NULL OR :category = 'all' OR LOWER(p.category) = LOWER(:category))
          AND (:query IS NULL OR :query = '' OR (
                LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(p.author.name) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(p.categoryLabel) LIKE LOWER(CONCAT('%', :query, '%'))
          ))
        ORDER BY p.createdAt DESC
    """)
    List<CommunityPost> findFilteredRecent(@Param("category") String category, @Param("query") String query);

    @Query("SELECT p FROM CommunityPost p WHERE p.reportsCount > 0 ORDER BY p.reportsCount DESC, p.updatedAt DESC")
    List<CommunityPost> findReportedPosts();
}
