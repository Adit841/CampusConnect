package com.campusconnect.service;

import com.campusconnect.dto.ChatUserDto;
import com.campusconnect.dto.ConversationSummaryDto;
import com.campusconnect.dto.CreateConversationRequest;
import com.campusconnect.entity.Conversation;
import com.campusconnect.entity.ConversationParticipant;
import com.campusconnect.entity.Message;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.ConversationParticipantRepository;
import com.campusconnect.repository.ConversationRepository;
import com.campusconnect.repository.MessageRepository;
import com.campusconnect.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for conversations.
 */
@Service
@Transactional
public class ConversationService {

    private final ConversationRepository conversationRepo;
    private final ConversationParticipantRepository participantRepo;
    private final UserRepository userRepo;
    private final MessageRepository messageRepo;

    public ConversationService(ConversationRepository conversationRepo,
                               ConversationParticipantRepository participantRepo,
                               UserRepository userRepo,
                               MessageRepository messageRepo) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.userRepo = userRepo;
        this.messageRepo = messageRepo;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Returns all conversations for the authenticated user as summary DTOs,
     * ordered by the most recently created first.
     */
    @Transactional(readOnly = true)
    public List<ConversationSummaryDto> listForUser(String principalName) {
        User currentUser = requireUser(principalName);
        List<Conversation> conversations = conversationRepo.findByParticipantUserId(currentUser.getId());
        return conversations.stream()
                .map(c -> toSummary(c, currentUser))
                .sorted((a, b) -> {
                    if (a.lastMessageAt() == null && b.lastMessageAt() == null) return 0;
                    if (a.lastMessageAt() == null) return 1;
                    if (b.lastMessageAt() == null) return -1;
                    return b.lastMessageAt().compareTo(a.lastMessageAt());
                })
                .toList();
    }

    /**
     * Finds an existing one-to-one conversation between the current user and the
     * target user, or creates a new one if none exists.
     */
    public ConversationSummaryDto findOrCreate(String principalName, CreateConversationRequest request) {
        User currentUser = requireUser(principalName);
        User targetUser = userRepo.findById(request.targetUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Target user not found: " + request.targetUserId()));

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new BadRequestException("Cannot start a conversation with yourself");
        }

        Conversation conversation = conversationRepo
                .findOneToOne(currentUser.getId(), targetUser.getId())
                .orElseGet(() -> createNew(currentUser, targetUser));

        return toSummary(conversation, currentUser);
    }

    /**
     * Resolves a conversation by ID and verifies the current user is a participant.
     */
    @Transactional(readOnly = true)
    public Conversation requireMembership(Long conversationId, String principalName) {
        User currentUser = requireUser(principalName);
        Conversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Conversation not found: " + conversationId));
        boolean isMember = participantRepo.existsByConversationAndUser(conversation, currentUser);
        if (!isMember) {
            throw new AccessDeniedException(
                    "Access denied: user is not a participant in conversation " + conversationId);
        }
        return conversation;
    }

    /**
     * Looks up a User by their authenticated principal name (email).
     */
    public User requireUser(String principalName) {
        return userRepo.findByEmail(principalName)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found for: " + principalName));
    }

    /**
     * Searches for users by name or email for the "New Conversation" dialog.
     * Excludes the current user and caps results at 20.
     */
    @Transactional(readOnly = true)
    public List<ChatUserDto> searchUsers(String principalName, String query) {
        if (query.isBlank()) {
            return List.of();
        }
        User currentUser = requireUser(principalName);
        return userRepo.searchByNameOrEmail(query, currentUser.getId()).stream()
                .limit(20)
                .map(ChatUserDto::from)
                .toList();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Conversation createNew(User user1, User user2) {
        Conversation conversation = new Conversation();
        conversation = conversationRepo.save(conversation);
        ConversationParticipant p1 = new ConversationParticipant(conversation, user1);
        ConversationParticipant p2 = new ConversationParticipant(conversation, user2);
        p1 = participantRepo.save(p1);
        p2 = participantRepo.save(p2);
        conversation.getParticipants().add(p1);
        conversation.getParticipants().add(p2);
        return conversation;
    }

    private ConversationSummaryDto toSummary(Conversation conversation, User currentUser) {
        // Resolve participants, falling back to direct repository lookup if collection uninitialized or empty
        List<ConversationParticipant> participants = conversation.getParticipants();
        if (participants == null || participants.isEmpty()) {
            participants = participantRepo.findByConversationId(conversation.getId());
        }

        // Find the other participant
        User other = participants.stream()
                .map(ConversationParticipant::getUser)
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .findFirst()
                .orElse(currentUser); // edge case: fallback only if no other participant found

        // Latest message preview (last page with 1 item)
        var messagePage = messageRepo.findByConversationId(
                conversation.getId(), PageRequest.of(0, 1,
                        org.springframework.data.domain.Sort.by("sentAt").descending()));
        Message last = messagePage.isEmpty() ? null : messagePage.getContent().getFirst();

        String lastContent = last != null ? last.getContent() : null;
        var lastAt = last != null ? last.getSentAt() : conversation.getCreatedAt();
        Long lastSenderId = last != null ? last.getSender().getId() : null;

        return new ConversationSummaryDto(
                conversation.getId(),
                other.getId(),
                other.getEmail(),
                other.getName(),
                lastContent,
                lastAt,
                0,
                lastSenderId
        );
    }
}
