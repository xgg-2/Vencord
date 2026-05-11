import definePlugin from "@utils/types";
import { FluxDispatcher, RestAPI } from "@webpack/common";

export default definePlugin({
    name: "Unfriending",
    description: "Automatically rejects all incoming friend requests",
    authors: [{ name: "You", id: 0n }],

    onRelationshipAdd({ relationship }: { relationship: { id: string; type: number; }; }) {
        
        if (relationship.type === 3) {
            RestAPI.delete({
                url: `/users/@me/relationships/${relationship.id}`
            });
        }
    },

    start() {
        FluxDispatcher.subscribe("RELATIONSHIP_ADD", this.onRelationshipAdd);
    },

    stop() {
        FluxDispatcher.unsubscribe("RELATIONSHIP_ADD", this.onRelationshipAdd);
    },
});
