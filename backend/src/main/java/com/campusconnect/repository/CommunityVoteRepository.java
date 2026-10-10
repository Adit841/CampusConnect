package com.campusconnect.repository;

import com.campusconnect.entity.CommunityVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityVoteRepository extends JpaRepository<CommunityVote, Long> {

    Optional<CommunityVote> findByPostIdAndUserId(Long postId, Long userId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    int countByPostId(Long postId);

    void deleteByPostIdAndUserId(Long postId, Long userId);

    @Query("SELECT CAST(v.user.id AS string) FROM CommunityVote v WHERE v.post.id = :postId")
    List<String> findVoterUserIdsByPostId(@Param("postId") Long postId);
}
