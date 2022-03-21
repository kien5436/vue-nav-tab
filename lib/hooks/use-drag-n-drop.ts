import { useTabs } from "./use-operations";

export default function useDragDrop(group: string) {

  const tabs = useTabs(group);

  function dragStart(e: DragEvent) {

    let id = (e.target as HTMLElement).id;
    id = id.slice(0, id.lastIndexOf("-tab"));

    e.dataTransfer?.setData("text/vnt-group", group);
    e.dataTransfer?.setData("text/plain", id);
  }

  function dragOver(e: DragEvent) {

    if (group !== e.dataTransfer?.getData("text/vnt-group")) return;

    e.preventDefault();

    const draggedItemId = e.dataTransfer?.getData("text/plain");
    const draggedIdx = tabs.findIndex((tab) => tab.id === draggedItemId);
    const targetItem = (e.target as HTMLElement).closest(".vp-item");

    if (null === targetItem) return;

    const targetId = targetItem.id.slice(0, targetItem.id.lastIndexOf("-tab"));
    const targetIdx = tabs.findIndex((tab) => tab.id === targetId);

    if (draggedIdx !== targetIdx) {

      [tabs[draggedIdx], tabs[targetIdx]] = [tabs[targetIdx], tabs[draggedIdx]];
      tabs.splice(0, 0);
    }
  }

  function drop(e: DragEvent) {

    e.preventDefault();

    if (group !== e.dataTransfer?.getData("text/vnt-group")) return;

    const draggedItemId = e.dataTransfer?.getData("text/plain");
    const draggedIdx = tabs.findIndex((tab) => tab.id === draggedItemId);
    const targetItem = (e.target as HTMLElement).closest(".vp-item");

    if (null === targetItem) return;

    const targetId = targetItem.id.slice(0, targetItem.id.lastIndexOf("-tab"));
    const targetIdx = tabs.findIndex((tab) => tab.id === targetId);

    if (draggedIdx !== targetIdx) {

      [tabs[draggedIdx], tabs[targetIdx]] = [tabs[targetIdx], tabs[draggedIdx]];
      tabs.splice(0, 0);
    }
  }

  return {
    dragOver,
    dragStart,
    drop,
  };
}