package com.campusconnect.repository;

import com.campusconnect.entity.CommunityComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {

    List<CommunityComment> findByPostIdOrderByCreatedAtAsc(Long postId);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM CommunityComment c JOIN FETCH c.author WHERE c.post.id IN :postIds ORDER BY c.createdAt ASC, c.id ASC")
    List<CommunityComment> findByPostIdIn(@org.springframework.data.repository.query.Param("postIds") java.util.Collection<Long> postIds);

    int countByPostId(Long postId);
}
