import ForwardedIconComponent from "@/components/genericIconComponent";
import useFlowStore from "@/stores/flowStore";
import { Handle, Position } from "reactflow";
import ShadTooltip from "../../../../components/shadTooltipComponent";
import {
  isValidConnection,
  scapedJSONStringfy,
} from "../../../../utils/reactflowUtils";
import { classNames, cn, groupByFamily } from "../../../../utils/utils";
import HandleTooltipComponent from "../HandleTooltipComponent";

export default function HandleRenderComponent({
  left,
  nodes,
  tooltipTitle = "",
  proxy,
  id,
  title,
  edges,
  myData,
  colors,
  setFilterEdge,
  showNode,
  testIdComplement,
  nodeId,
}: {
  left: boolean;
  nodes: any;
  tooltipTitle?: string;
  proxy?: any;
  id: any;
  title: string;
  edges: any;
  myData: any;
  colors: string[];
  setFilterEdge: any;
  showNode: any;
  testIdComplement?: string;
  nodeId: string;
}) {
  const setHandleDragging = useFlowStore((state) => state.setHandleDragging);
  const setFilterType = useFlowStore((state) => state.setFilterType);
  const handleDragging = useFlowStore((state) => state.handleDragging);
  const filterType = useFlowStore((state) => state.filterType);

  const onConnect = useFlowStore((state) => state.onConnect);

  const handleMouseUp = () => {
    setHandleDragging(undefined);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const getConnection = (semiConnection: {
    source: string | undefined;
    sourceHandle: string | undefined;
    target: string | undefined;
    targetHandle: string | undefined;
  }) => ({
    source: semiConnection.source ?? nodeId,
    sourceHandle: semiConnection.sourceHandle ?? myId,
    target: semiConnection.target ?? nodeId,
    targetHandle: semiConnection.targetHandle ?? myId,
  });

  const myId = scapedJSONStringfy(proxy ? { ...id, proxy } : id);

  const ownDraggingHandle =
    handleDragging &&
    (left ? handleDragging.target : handleDragging.source) === nodeId &&
    (left ? handleDragging.targetHandle : handleDragging.sourceHandle) === myId;

  const ownFilterHandle =
    filterType &&
    (left ? filterType.target : filterType.source) === nodeId &&
    (left ? filterType.targetHandle : filterType.sourceHandle) === myId;

  const ownHandle = ownDraggingHandle || ownFilterHandle;

  const draggingOpenHandle =
    handleDragging &&
    (left ? handleDragging.source : handleDragging.target) &&
    !ownDraggingHandle
      ? isValidConnection(getConnection(handleDragging), nodes, edges)
      : false;

  const filterOpenHandle =
    filterType &&
    (left ? filterType.source : filterType.target) &&
    !ownFilterHandle
      ? isValidConnection(getConnection(filterType), nodes, edges)
      : false;

  const openHandle = filterOpenHandle || draggingOpenHandle;

  const filterPresent = handleDragging || filterType;

  const currentFilter = left
    ? {
        targetHandle: myId,
        target: nodeId,
        source: undefined,
        sourceHandle: undefined,
        type: tooltipTitle,
        color: colors[0],
      }
    : {
        sourceHandle: myId,
        source: nodeId,
        target: undefined,
        targetHandle: undefined,
        type: tooltipTitle,
        color: colors[0],
      };

  const handleColor =
    filterPresent && !(openHandle || ownHandle)
      ? "conic-gradient(gray 0deg 360deg)"
      : "conic-gradient(" +
        colors
          .concat(colors[0])
          .map(
            (color, index) =>
              color +
              " " +
              ((360 / colors.length) * index - 360 / (colors.length * 4)) +
              "deg " +
              ((360 / colors.length) * index + 360 / (colors.length * 4)) +
              "deg",
          )
          .join(" ,") +
        ")";

  return (
    <div>
      <ShadTooltip
        styleClasses={"tooltip-fixed-width custom-scroll nowheel"}
        delayDuration={1000}
        content={
          <HandleTooltipComponent
            isInput={left}
            color={colors[0]}
            tooltipTitle={tooltipTitle}
          />
        }
        side={left ? "left" : "right"}
      >
        <Handle
          data-testid={`handle-${testIdComplement}-${title.toLowerCase()}-${
            !showNode ? (left ? "target" : "source") : left ? "left" : "right"
          }`}
          type={left ? "target" : "source"}
          position={left ? Position.Left : Position.Right}
          key={myId}
          id={myId}
          isValidConnection={(connection) =>
            isValidConnection(connection, nodes, edges)
          }
          className={classNames(
            `group/handle z-20 rounded-full border-none transition-all`,
            filterPresent
              ? openHandle || ownHandle
                ? cn("h-6 w-6")
                : cn("h-1.5 w-1.5")
              : cn("h-1.5 w-1.5 group-hover/node:h-6 group-hover/node:w-6"),
          )}
          style={{
            background: handleColor,
          }}
          onClick={() => {
            setFilterEdge(groupByFamily(myData, tooltipTitle!, left, nodes!));
            setFilterType(currentFilter);
            if (filterOpenHandle && filterType) {
              onConnect(getConnection(filterType));
              setFilterType(undefined);
              setFilterEdge([]);
            }
          }}
          onMouseDown={() => {
            setHandleDragging(currentFilter);
            document.addEventListener("mouseup", handleMouseUp);
          }}
        >
          <div
            className={cn(
              "pointer-events-none absolute left-1/2 top-[50%] z-30 flex h-0 w-0 -translate-x-1/2 translate-y-[-50%] items-center justify-center rounded-full bg-background transition-all group-hover/handle:bg-transparent",
              filterPresent
                ? openHandle || ownHandle
                  ? cn(
                      "h-5 w-5",
                      ownHandle ? "bg-transparent" : "bg-background",
                    )
                  : ""
                : "group-hover/node:h-5 group-hover/node:w-5",
            )}
          >
            <ForwardedIconComponent
              iconColor={colors[0]}
              name="ArrowRight"
              className={cn(
                "h-4 w-4 scale-0 stroke-2 transition-all",
                left && "rotate-180 transform",
                filterPresent
                  ? openHandle || ownHandle
                    ? cn(
                        ownHandle
                          ? "text-background"
                          : "group-hover/handle:text-background",
                        "scale-100",
                      )
                    : ""
                  : "group-hover/node:scale-100 group-hover/handle:text-background",
              )}
            />
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-[50%] z-10 flex h-3 w-3 -translate-x-1/2 translate-y-[-50%] items-center justify-center rounded-full opacity-50 transition-all"
            style={{
              background: handleColor,
            }}
          />
        </Handle>
      </ShadTooltip>
    </div>
  );
}
