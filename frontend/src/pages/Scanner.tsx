import { useState, useRef } from 'react';
import { useEvents } from '../context/EventContext';
import { Scanner as QRScanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { QrCode, CheckCircle2, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Scanner() {
  const { checkInByTicket, getRegistrationsByEvent, events } = useEvents();
  const [ticketId, setTicketId] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualMode, setManualMode] = useState(false);

  const handleScan = async (result: any) => {
    if (result && result.length > 0) {
      const scannedId = result[0].rawValue;
      processCheckIn(scannedId);
    }
  };

  const processCheckIn = async (id: string) => {
    try {
      const reg = await checkInByTicket(id);
      if (reg) {
        setScanResult({
          success: true,
          message: 'Check-in successful!',
          user: reg.profiles?.full_name,
          ticket: id,
          event: events.find(e => e.id === reg.event_id)?.title
        });
        toast.success(`Checked in ${reg.profiles?.full_name}`);
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.message || 'Invalid ticket or already checked in',
        ticket: id
      });
      toast.error('Check-in failed');
    }
    setTicketId('');
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">QR Scanner</h1>
          <p className="text-muted-foreground">Scan participant tickets for event check-in.</p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <Button variant={manualMode ? 'outline' : 'default'} onClick={() => setManualMode(false)}>
            <QrCode className="w-4 h-4 mr-2" /> Camera Scanner
          </Button>
          <Button variant={manualMode ? 'default' : 'outline'} onClick={() => setManualMode(true)}>
            <Search className="w-4 h-4 mr-2" /> Manual Entry
          </Button>
        </div>

        {manualMode ? (
          <Card>
            <CardHeader>
              <CardTitle>Manual Check-in</CardTitle>
              <CardDescription>Enter the ticket ID manually if QR scanning fails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Enter Ticket ID (e.g. TKT-123456...)" 
                value={ticketId}
                onChange={e => setTicketId(e.target.value)}
              />
              <Button className="w-full" onClick={() => processCheckIn(ticketId)} disabled={!ticketId}>
                Verify & Check-in
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-primary/20 shadow-xl">
            <div className="aspect-square bg-black relative">
              <QRScanner
                onScan={handleScan}
                components={{ tracker: true, audio: false }}
              />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none z-10"></div>
              <div className="absolute inset-x-12 inset-y-12 border-2 border-primary/50 rounded-3xl pointer-events-none z-20">
                <div className="w-full h-0.5 bg-primary/50 animate-scan shadow-[0_0_8px_rgba(var(--primary),0.8)]"></div>
              </div>
            </div>
            <CardContent className="p-4 text-center bg-card">
              <p className="text-sm font-medium">Position the QR code within the frame to scan</p>
            </CardContent>
          </Card>
        )}

        {scanResult && (
          <Card className={`border-2 ${scanResult.success ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}`}>
            <CardContent className="p-6 text-center space-y-4">
              {scanResult.success ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-success mb-1">{scanResult.message}</h3>
                    <p className="font-semibold text-foreground">{scanResult.user}</p>
                    <p className="text-sm text-muted-foreground">{scanResult.event}</p>
                    <Badge variant="outline" className="mt-2">{scanResult.ticket}</Badge>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-destructive mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-destructive mb-1">Check-in Failed</h3>
                    <p className="text-sm text-muted-foreground">{scanResult.message}</p>
                    <Badge variant="outline" className="mt-2">{scanResult.ticket}</Badge>
                  </div>
                </>
              )}
              <Button variant="outline" onClick={() => setScanResult(null)} className="w-full">
                Clear Result
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
