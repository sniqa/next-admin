"use client";

import ComboboxSelect from "@/components/custom/selectWithCreate";
import CreateDeviceDialog from "@/components/dialog/createDeviceDialog";
import CreateDeviceModelDialog from "@/components/dialog/createDeviceModelDialog";
import CreateNetworkDialog from "@/components/dialog/createNetworkDialog";
import CreateUserDialog from "@/components/dialog/createUserDialog";
import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const TestPage = () => {
  const [opened1, handle1] = useDisclosure(false);
  const [opened2, handle2] = useDisclosure(false);
  const [opened3, handle3] = useDisclosure(false);
  const [opened4, handle4] = useDisclosure(false);

  return (
    <div className="flex gap-4">
      <Button onClick={handle1.open}>deviceModel</Button>
      <Button onClick={handle2.open}>User</Button>
      <Button onClick={handle3.open}>netowrk</Button>
      <Button onClick={handle4.open}>netowrk</Button>

      <ComboboxSelect
        data={[
          { value: "1dfgdgdgerg", label: "1sgegdsgeggdgegd" },
          { value: "34", label: "3" },
        ]}
        onCreate={handle2.open}
        searchable
      />

      <CreateDeviceModelDialog opened={opened1} onClose={handle1.close} />
      <CreateUserDialog opened={opened2} onClose={handle2.close} />
      <CreateNetworkDialog opened={opened3} onClose={handle3.close} />
      <CreateDeviceDialog opened={opened4} onClose={handle4.close} />
    </div>
  );
};

export default TestPage;
