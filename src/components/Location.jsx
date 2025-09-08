"use client";

import { useState, useEffect } from "react";

export default function Location() {
  const [permission, setPermission] = useState("prompt");
  const [position, setPosition] = useState({ coords: null, error: null });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermission("unsupported");
      return;
    }

    if (!window.isSecureContext && window.location.protocol !== "http:") {
      setPosition({
        coords: null,
        error:
          "Location access requires a secure connection (HTTPS). Please ensure you are using https:// in the URL.",
      });
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        updatePermissionState(permissionStatus.state);
        permissionStatus.onchange = () => {
          updatePermissionState(permissionStatus.state);
        };
      })
      .catch(() => {
        setPermission("prompt");
      });
  }, []);

  const updatePermissionState = (state) => {
    if (state === "granted" || state === "denied") {
      setPermission(state);
      if (state === "granted") {
        getPosition();
      }
    } else {
      setPermission("prompt");
    }
  };

  const getPosition = (options) => {
    setIsLoading(true);
    setPosition({ coords: null, error: null });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          error: null,
        });
        setIsLoading(false);
      },
      (error) => {
        setPosition({
          coords: null,
          error: getErrorMessage(error.code),
        });
        setIsLoading(false);
      },
      options
    );
  };

  const getErrorMessage = (code) => {
    if (
      window.isSecureContext === false &&
      window.location.protocol !== "https:"
    ) {
      return "Location access requires a secure connection (HTTPS). Please ensure you are using https:// in the URL.";
    }

    switch (code) {
      case 1:
        return "Permission denied. Please enable location access in your browser settings.";
      case 2:
        return "Unable to retrieve your location. Please check your network connection.";
      case 3:
        return "Location request timed out. Please try again.";
      default:
        return "An unknown error occurred while getting your location.";
    }
  };

  const requestLocation = (highAccuracy = false) => {
    getPosition({
      enableHighAccuracy: highAccuracy,
      timeout: 10000,
      maximumAge: 0,
    });
  };

  const handlePermissionRequest = (granted) => {
    if (granted) {
      setPermission("granted");
      getPosition();
    } else {
      setPermission("denied");
    }
  };

  const openSettings = () => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "denied") {
            alert("Please enable location access in your browser settings.");
          }
        });
    } else {
      alert("Please enable location access in your browser settings.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Location Access
      </h1>

      {permission === "unsupported" ? (
        <div className="text-red-500 mb-4">
          Your browser does not support geolocation features.
        </div>
      ) : permission === "prompt" ? (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This app would like to access your location to provide better
            service.
          </p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handlePermissionRequest(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Allow Location Access
            </button>
            <button
              onClick={() => handlePermissionRequest(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Deny
            </button>
          </div>
        </div>
      ) : permission === "denied" ? (
        <div className="space-y-4">
          <p className="text-red-500">
            Location access was denied. To enable location access:
          </p>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>Click the lock icon in your browser's address bar</li>
            <li>Find "Site settings" or "Permissions"</li>
            <li>Change the location permission to "Allow"</li>
            <li>Refresh the page</li>
          </ol>
          <button
            onClick={openSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
          >
            Open Browser Settings
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">
              Location access granted
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Getting your location...
              </p>
            </div>
          ) : position.error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-red-600 dark:text-red-400">{position.error}</p>
            </div>
          ) : position.coords ? (
            <div className="space-y-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Latitude:</span>{" "}
                {position.coords.latitude.toFixed(6)}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Longitude:</span>{" "}
                {position.coords.longitude.toFixed(6)}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Accuracy:</span>{" "}
                {Math.round(position.coords.accuracy)} meters
              </p>
            </div>
          ) : null}

          <div className="flex flex-col space-y-2 pt-4">
            <button
              onClick={() => requestLocation(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Get Precise Location"}
            </button>
            <button
              onClick={() => requestLocation(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Get Approximate Location"}
            </button>
            <button
              onClick={() => setPermission("denied")}
              className="px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm text-center"
            >
              Revoke Permission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
