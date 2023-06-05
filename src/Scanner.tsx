import {
  Html5QrcodeScanType,
  Html5QrcodeScanner,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { useEffect, useRef } from "react";
import UUID from "pure-uuid";

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
    verbose?: boolean;
    onSuccess: QrcodeSuccessCallback;
    onError?: QrcodeErrorCallback;
  }
) => {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // when component mounts
    const config = createConfig(props);
    const verbose = props.verbose === true;
    // Suceess callback is required.
    if (!props.onSuccess) {
      throw "onSuccess is required callback.";
    }
    const el = elRef.current;
    if (!el) {
      throw "Element ref is null";
    }
    el.id = new UUID(4).toString();
    const html5QrcodeScanner = new Html5QrcodeScanner(el.id, config, verbose);
    html5QrcodeScanner.render(props.onSuccess, props.onError);

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner
        .clear()
        .then(() => {
          console.log("Successfully cleared html5QrcodeScanner.");
        })
        .catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
    };
  }, [props.onSuccess, props.onError, props]);

  return <div ref={elRef} />;
};

export default Scanner;
