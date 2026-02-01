package com.InteractiveQ.main.entities;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "like_message")
@IdClass(LikeId.class)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class LikeMessage {
    @Id
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
    private Person person;

    @Id
    @ManyToOne
    @JoinColumn(name = "message_id", referencedColumnName = "message_id", insertable = false, updatable = false)
    private Message message;
}
