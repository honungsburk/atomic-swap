import React from "react";
import Scrollbars from "react-custom-scrollbars";

function CustomScrollbars(props: {
  onScroll?: React.UIEventHandler<any> | undefined;
  forwardedRef: any;
  style: any;
  children: JSX.Element;
}) {
  const refSetter = React.useCallback(
    (scrollbarsRef) => {
      if (scrollbarsRef) {
        props.forwardedRef(scrollbarsRef.view);
      } else {
        props.forwardedRef(null);
      }
    },
    [props]
  );

  return (
    <Scrollbars
      ref={refSetter}
      style={{ ...props.style, overflow: "hidden", marginRight: 4 }}
      onScroll={props.onScroll}
    >
      {props.children}
    </Scrollbars>
  );
}

const CustomScrollbarsVirtualList = React.forwardRef(
  (
    props: {
      onScroll?: React.UIEventHandler<any> | undefined;
      children: JSX.Element;
      style: any;
    },
    ref
  ) => <CustomScrollbars {...props} forwardedRef={ref} />
);

CustomScrollbarsVirtualList.displayName = "CustomScrollbarsVirtualList";

export default CustomScrollbarsVirtualList;
