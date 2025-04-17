"""
User repository to interact with the database.
"""

import re

from logger import logger
from models.event import Event
from motor.motor_asyncio import AsyncIOMotorCollection


class HistoryRepository:
    """
    History repository to interact with the database.

    Attributes:
        client: MongoDB collection instance.
    """

    client: AsyncIOMotorCollection

    def __init__(self, client: AsyncIOMotorCollection):
        self.client = client

    async def save_event(self, event: Event):
        """
        Save an event to the database.

        Args:
            event: Event object to be saved.
        """
        await self.client.find_one_and_replace(
            filter={"id": event.id},
            replacement=event.model_dump(),
            upsert=True,
        )

    async def get_active_event_by_message_id(
        self, message_id: str, timestamp: int
    ) -> Event | None:
        """
        Get an active event (that is created but not outdated) by message ID and timestamp.

        Args:
            message_id: ID of the message.
            timestamp: Timestamp to check against.

        Returns:
            Event object if found, None otherwise.
        """
        data = await self.client.find_one(
            {
                "message.id": message_id,
                "created_at": {
                    "$lte": timestamp,
                },
                "outdated_at": {
                    "$gte": timestamp,
                },
            }
        )
        return data and Event.model_validate(data)

    def _build_filters(
        self,
        start_timestamp: int | None = None,
        end_timestamp: int | None = None,
        entity_filters: list[str] | None = None,
        status_filters: list[str] | None = None,
        affiliation_filters: list[str] | None = None,
    ):
        filters = []
        if start_timestamp is not None and end_timestamp is not None:
            filters.append(
                {
                    "$or": [
                        {
                            "created_at": {
                                "$gte": start_timestamp,
                                "$lte": end_timestamp,
                            }
                        },
                        {
                            "outdated_at": {
                                "$gte": start_timestamp,
                                "$lte": end_timestamp,
                            }
                        },
                    ]
                }
            )
        elif start_timestamp is not None:
            filters.append({"outdated_at": {"$gte": start_timestamp}})
        elif end_timestamp is not None:
            filters.append({"created_at": {"$lte": end_timestamp}})

        if status_filters:
            filters.append({"message.entity.status": {"$in": status_filters}})
        if affiliation_filters:
            filters.append({"message.entity.affiliation": {"$in": affiliation_filters}})
        if entity_filters:
            pattern = "|".join(["^" + re.escape(entity) for entity in entity_filters])
            filters.append({"message.entity.entity": {"$regex": pattern}})

        return filters

    async def filter_events(
        self,
        start_timestamp: int | None = None,
        end_timestamp: int | None = None,
        entities: list[str] | None = None,
        statuses: list[str] | None = None,
        affiliations: list[str] | None = None,
    ) -> list[dict]:
        """
        Get only message objects from events within a time range with specified
        entity, status, and affiliation. Returns only the message field from the
        latest version of each message.

        Args:
            start_timestamp: Start timestamp for the filter.
            end_timestamp: End timestamp for the filter.
            entities: List of entity filters.
            statuses: List of status filters.
            affiliations: List of affiliation filters.

        Returns:
            List of message objects only
        """
        filters = self._build_filters(
            start_timestamp,
            end_timestamp,
            entities,
            statuses,
            affiliations,
        )

        pipeline = []
        if filters:
            pipeline.append(
                {
                    "$match": {
                        "$and": filters,
                    }
                }
            ),

        pipeline += [
            {
                "$sort": {
                    "created_at": -1,
                    "outdated_at": -1,
                }
            },
            {
                "$group": {
                    "_id": "$message.id",
                    "latest_event": {"$first": "$$ROOT"},
                }
            },
            {"$replaceRoot": {"newRoot": "$latest_event"}},
            {"$project": {"_id": 0, "message": 1}},
            {"$limit": 1000},
        ]

        logger.info("Applying aggregation pipeline: %s", pipeline)
        return await self.client.aggregate(pipeline).to_list(length=None)
