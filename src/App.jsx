import React from 'react';
import { useGameState } from "./hooks/hooks";
import HomeView from "./home/HomeView";
import AdventureView from "./adventure/adventure";
import CollectionView from "./collection/CollectionView";
import GardenView from "./garden/garden";
import TeamView from "./team/TeamView";
import StoryView from "./story/StoryView";
import { Notification, BottomNav } from "./components/ui";

export default function BeastTamerGame() {
  const game = useGameState();

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100dvh", background: "#f8fafc", position: "relative" }}>
      {game.notification && <Notification notification={game.notification} />}

      <div style={{ paddingBottom: 70 }}>
        {game.currentTab === "home"       && <HomeView       game={game} />}
        {game.currentTab === "adventure"  && <AdventureView  game={game} />}
        {game.currentTab === "collection" && <CollectionView game={game} />}
        {game.currentTab === "garden"     && <GardenView     game={game} />}
        {game.currentTab === "team"       && <TeamView       game={game} />}
        {game.currentTab === "story"      && <StoryView      game={game} />}
      </div>

      <BottomNav tab={game.currentTab} setTab={game.setCurrentTab} />
    </div>
  );
}
