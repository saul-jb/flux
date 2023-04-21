import {
  reactive,
  watch,
  ref,
  computed,
  watchEffect,
  isReadonly,
  WatchSource,
  readonly,
} from "vue";
import { SubjectRepository } from "utils/factory";
import { PerspectiveProxy } from "@perspect3vism/ad4m";

export function useEntry<SubjectClass>({
  perspective,
  source,
  id,
  model,
}: {
  perspective: PerspectiveProxy | Function;
  id?: string | Function;
  source?: string | Function;
  model: SubjectClass;
}) {
  const idRef = typeof id === "function" ? (id as any) : ref(id);
  const sourceRef =
    typeof source === "function" ? (source as any) : ref(source);
  const perspectiveRef =
    typeof perspective === "function" ? (perspective as any) : perspective;

  let entry = ref<Record<string, any> | null>(null);
  let subject = ref<SubjectRepository<any> | null>(null);

  watch(
    [perspectiveRef, sourceRef, idRef],
    async ([p, s, id]) => {
      if (p?.uuid) {
        const subject = new SubjectRepository(model, {
          perspectiveUuid: p?.uuid,
          source: s,
        });

        const res = await subject.getData(id);
        console.log("in response", { entry: res, id, model, s, p });
        if (res) {
          entry.value = res;
        }
      }
    },
    { immediate: true }
  );

  return { entry, subject };
}
