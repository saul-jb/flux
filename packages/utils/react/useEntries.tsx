import React, { useEffect, useState, useMemo } from "react";
import EntryModel from "../helpers/model";

export default function useEntries({
  perspectiveUuid,
  source,
  model,
}: {
  perspectiveUuid: string;
  source?: string;
  model: typeof EntryModel;
}) {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

  const Model = useMemo(() => {
    return new model({ perspectiveUuid, source });
  }, [perspectiveUuid, source]);

  useEffect(() => {
    if (perspectiveUuid && source) {
      getAll();
      subscribe();
    }
  }, [perspectiveUuid, source]);

  async function getAll() {
    try {
      setLoading(true);
      const entries = await Model.getAll();
      setEntries(entries);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  function subscribe() {
    Model.onAdded((entry) => {
      setEntries((oldEntries) => {
        const hasEntry = oldEntries.find((e) => e.id === entry.id);
        return hasEntry ? oldEntries : [entry, ...oldEntries];
      });
    });
  }

  return { entries, model: Model, loading };
}
