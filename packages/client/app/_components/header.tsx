"use client";

import { DeviceConstant, NetowrkConstant, UserConstant } from "@/lib/constant";
import { Anchor, Avatar } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  return (
    <div className="w-full h-16 border-b flex justify-between items-center px-4">
      <Anchor href="/">
        <Avatar src={"/hamster.png"} />
      </Anchor>

      <nav className="flex gap-4">
        <Link
          href={"/user"}
          className={`${
            pathname.includes("user")
              ? "border-b-2 border-sky-600 text-sky-600"
              : ""
          }`}
        >
          {UserConstant.USER}
        </Link>
        <Link
          href={"/network"}
          className={`${
            pathname.includes("network")
              ? "border-b-2 border-sky-600 text-sky-600"
              : ""
          }`}
        >
          {NetowrkConstant.NETWORK}
        </Link>

        <Link
          href={"/device"}
          className={`${
            pathname.includes("device")
              ? "border-b-2 border-sky-600 text-sky-600"
              : ""
          }`}
        >
          {DeviceConstant.DEVICE}
        </Link>
      </nav>
    </div>
  );
};

export default Header;
