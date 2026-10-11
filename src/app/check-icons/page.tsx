import { Icon } from "@/components/Icon";
import { Icon2 } from "@/components/Icon2";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-6 p-10">
      <h1 className="text-xl font-bold">Icon test</h1>

      <div className="flex items-center gap-4">
        <Icon name="Check" size="xs" color="primary" />
        <Icon name="Check" size="sm" color="primary" />
        <Icon name="Check" size="md" color="primary" />
        <Icon name="Check" size="lg" color="primary" />
        <Icon name="Check" size="xl" color="primary" />
      </div>

      <div className="flex items-center gap-4">
        <Icon name="Check" customSize={40} color="success" />
        <Icon name="Check" customSize={64} color="error" />
        <Icon name="Check" customSize={0} color="muted" />
      </div>

      <div className="flex items-center gap-4">
        <Icon2 name="Check" customSize={145} color="success" />
        <Icon2 name="Check" customSize={40} color="success" />
        <Icon2 name="Check" customSize={64} color="error" />
        <Icon2 name="Check" customSize={0} color="muted" />
      </div>
    </main>
  );
}
