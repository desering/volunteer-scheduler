# ER Diagram

```mermaid
erDiagram
    EVENT {
        string id PK
        string title
        date start_date
        date end_date
        richText description
    }
    SECTION {
        string id PK
        string event_id FK
        string title
        richText description
    }
    ROLE {
        string id PK
        string event_id FK
        string section_id FK
        string title
        richText description
        int maxSignups
    }
    SIGNUP {
        string id PK
        string event_id FK
        string role_id FK
        string user_id FK
    }
    USER {
        string id PK
        string preferredName
        string phoneNumber
        string roles
    }
    TAG {
        string id PK
        string text
    }
    ANNOUNCEMENT {
        string id PK
        string title
        richText description
        string status
    }
    EVENT_TEMPLATE {
        string id PK
        string template_title
        string event_title
        date start_time
        date end_time
        richText description
    }
    USER_NOTIFICATION_PREFERENCE {
        string id PK
        string user_id FK
        string type
        string channel
        boolean preference
    }

    EVENT o|--o{ SECTION : has
    EVENT ||--o{ ROLE : has
    SECTION o|--o{ ROLE : groups
    EVENT ||--o{ SIGNUP : has
    ROLE ||--o{ SIGNUP : has
    USER ||--o{ SIGNUP : creates
    USER ||--o{ USER_NOTIFICATION_PREFERENCE : sets
    EVENT }o--o{ TAG : tagged
    EVENT_TEMPLATE }o--o{ USER : template_signups
```
