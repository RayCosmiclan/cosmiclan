# Drafts Schema

Each agent can create drafts awaiting Gabriel's approval.

## Structure: `data/drafts/{agentId}.json`

```json
{
  "drafts": [
    {
      "id": "draft-uuid",
      "agentId": "marty",
      "type": "post_twitter" | "post_linkedin" | "post_instagram" | "image" | "video" | "blog",
      "platform": "twitter" | "linkedin" | "instagram" | "blog",
      "title": "Optional title for non-social content",
      "content": "The actual draft content",
      "metadata": {
        "hashtags": ["#web3", "#ai"],
        "mentions": ["@gabrielaxyeth"],
        "imageUrl": "optional preview image"
      },
      "preview": "Short preview for list display",
      "createdAt": 1712700000000,
      "requestedAt": null,
      "status": "pending" | "approved" | "rejected" | "posted",
      "approvedAt": null,
      "rejectionReason": null
    }
  ]
}
```

## Status Flow
- `pending` → awaiting Gabriel review
- `approved` → Gabriel approved, ready to post/publish
- `rejected` → Gabriel rejected with reason
- `posted` → Published to platform
