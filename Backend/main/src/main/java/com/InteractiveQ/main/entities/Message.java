package com.InteractiveQ.main.entities;

import lombok.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "message")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Integer messageId;

    @Column(name = "is_anonymous")
    private Boolean isAnonymous;
    @Column(name = "is_poll")
    private Boolean isPoll;
    @Column(name = "message_content", columnDefinition = "LONGTEXT")
    private String text;
    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "post_time")
    @CreationTimestamp
    private java.sql.Timestamp postTime;

    @ManyToOne
    @JoinColumn(name = "tag_id", referencedColumnName = "message_id")
    private Message taggedMessage;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private Person user;

    @ManyToOne
    @JoinColumn(name = "room_id", referencedColumnName = "room_id")
    private Room room;

    // Getters and Setters
}

