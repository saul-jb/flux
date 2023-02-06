import { useEffect, useState, useRef } from "preact/hooks";
import { CommunityProvider, AgentProvider } from "utils/react";
import AllCommunities from "./components/AllCommunities";
import WebRTCManager, { Event } from "./WebRTCManager";
import { grid } from "./components/UserGrid/UserGrid.module.css";
import {
  video,
  item,
  details,
} from "./components/UserGrid/Item/Item.module.css";

import styles from "./App.module.css";

type Peer = {
  did: string;
  connection: RTCPeerConnection;
};

function useWebRTC({ source, uuid }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isInitialised, setIsInitialised] = useState(false);
  const manager = useRef<WebRTCManager>();
  const [connections, setConnections] = useState<Peer[]>([]);

  useEffect(() => {
    if (source && uuid && !manager.current) {
      manager.current = new WebRTCManager({ source, uuid });

      manager.current.on(
        Event.PEER_ADDED,
        (did, connection: RTCPeerConnection) => {
          console.log("adding", did);
          const remoteStream = new MediaStream();

          const videElement = document.getElementById(
            `user-video-${did}`
          ) as HTMLVideoElement;

          if (videElement) {
            videElement.srcObject = remoteStream;
          }

          connection.ontrack = (event) => {
            console.log("ontrack", event.streams);
            event.streams[0].getTracks().forEach((track) => {
              console.log("added track", { track });
              remoteStream.addTrack(track);
            });
          };

          setConnections([...connections, { did, connection }]);
        }
      );

      manager.current.on(Event.PEER_REMOVED, (did) => {
        const filter = connections.filter((c) => c.did !== did);
        setConnections(filter);
      });

      setIsInitialised(true);
    }
  }, [source, uuid]);

  async function join() {
    await manager.current?.join();
    setLocalStream(manager.current.localStream);
  }

  function toggleCamera() {
    manager.current.localStream.getVideoTracks()[0].enabled = true;
  }

  return {
    localStream,
    connections,
    isInitialised,
    join,
    toggleCamera,
  };
}

function Channel({ source, uuid }) {
  const videoRef = useRef(null);
  const { connections, join, isInitialised, localStream, toggleCamera } =
    useWebRTC({
      source,
      uuid,
    });

  console.log({ connections });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = localStream;
      videoRef.current.muted = true;
    }
  }, [videoRef, localStream]);

  if (!isInitialised) return null;

  return (
    <div>
      <j-button onClick={() => join()}>Join</j-button>
      <j-button onClick={() => toggleCamera()}>Toggle</j-button>
      <div className={grid}>
        {localStream && (
          <div className={item} data-camera-enabled={true}>
            <video
              className={video}
              ref={videoRef}
              autoPlay
              playsInline
            ></video>
            <div className={details}>
              <j-text>Me</j-text>
            </div>
          </div>
        )}
        {connections.map((peer, i) => (
          <div className={item} data-camera-enabled={true}>
            <video
              id={`user-video-${peer.did}`}
              className={video}
              autoPlay
              playsInline
            ></video>
            <div className={details}>
              <j-text>{peer.did}</j-text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App({ perspective, source }) {
  return (
    <>
      {perspective ? (
        <AgentProvider>
          <CommunityProvider perspectiveUuid={perspective}>
            <Channel source={source} uuid={perspective} />
          </CommunityProvider>
        </AgentProvider>
      ) : (
        <div className={styles.appContainer}>
          <AllCommunities />
        </div>
      )}
    </>
  );
}
