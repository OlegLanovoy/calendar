import { DateTimeRangePicker } from "@/components/Calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Event Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <DateTimeRangePicker />
        </CardContent>
      </Card>
    </main>
  );
}
