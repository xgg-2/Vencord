/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2024 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { DataStore } from "@api/DataStore";
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { Button, FluxDispatcher, Forms, React, RestAPI } from "@webpack/common";

const STORE_KEY = "Unfriending_rejectedCount";

interface Relationship {
    id: string;
    type: number;
}

function StatsComponent() {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        DataStore.get(STORE_KEY).then((val: number | undefined) => setCount(val ?? 0));
    }, []);

    return (
        <Forms.FormSection>
            <Forms.FormTitle>Rejected Friend Requests</Forms.FormTitle>
            <Forms.FormText>
                Total rejected: <strong>{count}</strong>
            </Forms.FormText>
            <Button
                size={Button.Sizes.SMALL}
                color={Button.Colors.RED}
                style={{ marginTop: 8 }}
                onClick={async () => {
                    await DataStore.set(STORE_KEY, 0);
                    setCount(0);
                }}
            >
                Reset Counter
            </Button>
        </Forms.FormSection>
    );
}

const settings = definePluginSettings({
    stats: {
        type: OptionType.COMPONENT,
        description: "",
        component: StatsComponent
    }
});

export default definePlugin({
    name: "Unfriending",
    description: "Automatically rejects all incoming friend requests",
    authors: [{ name: "YourName", id: 0n }],
    settings,

    async onRelationshipAdd({ relationship }: { relationship: Relationship; }) {
        
        if (relationship.type === 3) {
            await RestAPI.del({
                url: `/users/@me/relationships/${relationship.id}`
            });
            const prev = await DataStore.get(STORE_KEY) ?? 0;
            await DataStore.set(STORE_KEY, prev + 1);
        }
    },

    start() {
        FluxDispatcher.subscribe("RELATIONSHIP_ADD", this.onRelationshipAdd);
    },

    stop() {
        FluxDispatcher.unsubscribe("RELATIONSHIP_ADD", this.onRelationshipAdd);
    },
});
