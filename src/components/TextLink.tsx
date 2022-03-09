import { LinkProps, Link } from "@chakra-ui/react";
import { ExternalIcon } from "./Icons";

function TextLink(props: LinkProps) {
  if (props.isExternal) {
    return (
      <Link {...props} color="teal.500">
        {props.children}
        <ExternalIcon fontSize={props.fontSize} />
      </Link>
    );
  } else {
    return <Link {...props} color="teal.500"></Link>;
  }
}

export default TextLink;
