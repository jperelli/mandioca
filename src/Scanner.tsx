import {
  Html5QrcodeScanType,
  Html5QrcodeScanner,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { useEffect, useLayoutEffect } from "react";

const qrcodeRegionId = "html5qr-code-full-region";

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: Partial<Html5QrcodeScannerConfig>) => {
  const config: Html5QrcodeScannerConfig = {
    fps: 5,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    aspectRatio: 1,      
  };
  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  return config;
};

const Scanner = (
  props: Partial<Html5QrcodeScannerConfig> & {
    verbose: boolean;
    onSuccess: QrcodeSuccessCallback;
    onError: QrcodeErrorCallback;
  }
) => {
  useLayoutEffect(() => {
    // when component mounts
    const config = createConfig(props);
    const verbose = props.verbose === true;
    // Suceess callback is required.
    if (!props.onSuccess) {
      throw "onSuccess is required callback.";
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      config,
      verbose
    );
    html5QrcodeScanner.render(props.onSuccess, props.onError);

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return <div id={qrcodeRegionId} />;
};

export default Scanner;
