import UUID from "pure-uuid";
import {
  Box,
  Center,
  LoadingOverlay,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { Html5QrcodeError } from "html5-qrcode/esm/core";
import {
  Html5QrcodeResult,
  Html5QrcodeScanType,
  Html5QrcodeScanner,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { IconCheck } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const ASP_TIMEOUT = 3000;
const ASP_TIMEOUT_INTERVAL = 50;

type ScannerSuccessEvent = CustomEventInit<{
  decodedText: string;
  result: Html5QrcodeResult;
}>;

type ScannerErrorEvent = CustomEventInit<{
  errorMessage: string;
  error: Html5QrcodeError;
}>;

const BarcodeReader = (props: {
  config?: Partial<Html5QrcodeScannerConfig> & { verbose?: boolean };
  onSuccess: QrcodeSuccessCallback;
  onError?: QrcodeErrorCallback;
}) => {
  const [afterScanPaused, setAfterScanPaused] = useState<string | null>(null);
  const [aspCountdown, setAspCountdown] = useState<number>(100);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (containerRef.current !== null) {
      // when component mounts
      const config: Html5QrcodeScannerConfig = {
        fps: 5,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1,
        ...props.config,
      };
      const verbose = props.config?.verbose === true;

      const el = containerRef.current;
      el.id = new UUID(4).toString();
      scannerRef.current = new Html5QrcodeScanner(el.id, config, verbose);
      scannerRef.current.render(
        (decodedText: string, result: Html5QrcodeResult) => {
          setAfterScanPaused(decodedText);
          setTimeout(() => {
            scannerRef.current?.resume();
            setAfterScanPaused(null);
          }, ASP_TIMEOUT);
          setAspCountdown(100);
          const aspInterval = setInterval(() => {
            setAspCountdown((prev) => {
              if (prev < 0) {
                clearInterval(aspInterval);
                return 100;
              }
              return prev - (ASP_TIMEOUT_INTERVAL / ASP_TIMEOUT) * 100;
            });
          }, ASP_TIMEOUT_INTERVAL);
          scannerRef.current?.pause();
          document.body.dispatchEvent(
            new CustomEvent("scanner:success", {
              detail: { decodedText, result },
            })
          );
        },
        (errorMessage: string, error: Html5QrcodeError) => {
          document.body.dispatchEvent(
            new CustomEvent("scanner:error", {
              detail: { errorMessage, error },
            })
          );
        }
      );

      return () => {
        scannerRef.current
          ?.clear()
          .then(() => {
            console.log("Successfully cleared html5QrcodeScanner.");
            scannerRef.current === null;
          })
          .catch((error) => {
            console.error("Failed to clear html5QrcodeScanner. ", error);
          });
      };
    }
  }, [scannerRef, containerRef, props.config]);

  useEffect(() => {
    const successCallback = (event: ScannerSuccessEvent) => {
      if (!event.detail) {
        return;
      }
      props.onSuccess(event.detail.decodedText, event.detail.result);
    };
    const errorCallback = (event: ScannerErrorEvent) => {
      if (props.onError && event.detail) {
        props.onError(event.detail.errorMessage, event.detail.error);
      }
    };
    document.body.addEventListener("scanner:success", successCallback);
    document.body.addEventListener("scanner:error", errorCallback);
    return () => {
      document.body.removeEventListener("scanner:success", successCallback);
      document.body.removeEventListener("scanner:error", errorCallback);
    };
  }, [props.onSuccess, props.onError]);

  return (
    <Box maw={400} pos="relative">
      <LoadingOverlay
        visible={afterScanPaused !== null}
        overlayBlur={10}
        overlayOpacity={0.7}
        overlayColor="#fff"
        loader={
          <Stack align="center">
            {/* <IconCircleCheck color="teal" size="10rem" /> */}
            <RingProgress
              sections={[{ value: aspCountdown || 0, color: "teal" }]}
              label={
                <Center>
                  <ThemeIcon color="teal" variant="light" radius="xl" size="xl">
                    <IconCheck size={22} />
                  </ThemeIcon>
                </Center>
              }
            />
            <Text fw={700} size="2rem">
              Decoded
            </Text>
            <Text fw={700} size="2rem">
              {afterScanPaused}
            </Text>
          </Stack>
        }
      />
      <div ref={containerRef} />
    </Box>
  );
};

export default BarcodeReader;
