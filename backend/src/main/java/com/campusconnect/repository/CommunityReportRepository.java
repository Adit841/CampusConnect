package com.campusconnect.repository;

import com.campusconnect.entity.CommunityReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityReportRepository extends JpaRepository<CommunityReport, Long> {

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    int countByPostId(Long postId);

    @Query("SELECT CAST(r.user.id AS string) FROM CommunityReport r WHERE r.post.id = :postId")
    List<String> findReporterUserIdsByPostId(@Param("postId") Long postId);

    @Query("SELECT r.post.id, CAST(r.user.id AS string) FROM CommunityReport r WHERE r.post.id IN :postIds")
    List<Object[]> findReporterUserIdsByPostIds(@Param("postIds") java.util.Collection<Long> postIds);

    void deleteByPostId(Long postId);
}
