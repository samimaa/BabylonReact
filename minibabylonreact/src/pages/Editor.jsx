import React from "react";
import * as MYBABY from '@babylonjs/core';
import '@babylonjs/loaders';
import { NodeEditor } from '@babylonjs/node-editor';
import '../styles/cta4xsb.css';
export default function Editor() {

  var snippetUrl = "https://snippet.babylonjs.com";
  var currentSnippetToken;
  var previousHash = "";
  var nodeMaterial;

  var customLoadObservable = new MYBABY.Observable();
  var editorDisplayed = false;


  var cleanHash = function () {
    var splits = decodeURIComponent(window.location.hash.substr(1)).split("#");

    if (splits.length > 2) {
      splits.splice(2, splits.length - 2);
    }

    window.location.hash = splits.join("#");
  }

  var checkHash = function () {
    if (window.location.hash) {
      if (previousHash != window.location.hash) {
        cleanHash();

        previousHash = window.location.hash;

        try {
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
              if (xmlHttp.status == 200) {
                var snippet = JSON.parse(JSON.parse(xmlHttp.responseText).jsonPayload);
                let serializationObject = JSON.parse(snippet.nodeMaterial);

                if (editorDisplayed) {
                  customLoadObservable.notifyObservers(serializationObject);
                } else {
                  nodeMaterial.loadFromSerialization(serializationObject);
                  try {
                    nodeMaterial.build(true);
                  } catch (err) {
                    // Swallow the error here
                  }
                  showEditor();
                }
              }
            }
          }

          var hash = window.location.hash.substr(1);
          currentSnippetToken = hash.split("#")[0];
          xmlHttp.open("GET", snippetUrl + "/" + hash.replace("#", "/"));
          xmlHttp.send();
        } catch (e) {

        }
      }
    }

    setTimeout(checkHash, 200);
  }

  var showEditor = function () {
    editorDisplayed = true;
    console.log("host element:");

    var hostElement = document.getElementById("host-element");
    console.log(hostElement);
    NodeEditor.Show({
      nodeMaterial: nodeMaterial,
      hostElement: hostElement,
      customLoadObservable: customLoadObservable,
      customSave: {
        label: "Save as unique URL",
        action: (data) => {
          return new Promise((resolve, reject) => {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
              if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                  var baseUrl = window.location.href.replace(window.location.hash, "").replace(window.location.search, "");
                  var snippet = JSON.parse(xmlHttp.responseText);
                  var newUrl = baseUrl + "#" + snippet.id;
                  currentSnippetToken = snippet.id;
                  if (snippet.version && snippet.version != "0") {
                    newUrl += "#" + snippet.version;
                  }
                  window.location.href = newUrl;
                  resolve();
                }
                else {
                  reject(`Unable to save your node material. It may be too large (${(dataToSend.payload.length / 1024).toFixed(2)} KB) because of embedded textures. Please reduce texture sizes or point to a specific url instead of embedding them and try again.`);
                }
              }
            }

            xmlHttp.open("POST", snippetUrl + (currentSnippetToken ? "/" + currentSnippetToken : ""), true);
            xmlHttp.setRequestHeader("Content-Type", "application/json");

            var dataToSend = {
              payload: JSON.stringify({
                nodeMaterial: data
              }),
              name: "",
              description: "",
              tags: ""
            };

            xmlHttp.send(JSON.stringify(dataToSend));
          });
        }
      }
    });
  }

  // Let's start
  if (MYBABY.Engine.isSupported()) {
    var canvas = document.createElement("canvas");
    var engine = new MYBABY.Engine(canvas, false, { disableWebGL2Support: false });
    var scene = new MYBABY.Scene(engine);
    var light0 = new MYBABY.HemisphericLight("light #0", new MYBABY.Vector3(0, 1, 0), scene);
    var light1 = new MYBABY.HemisphericLight("light #1", new MYBABY.Vector3(0, 1, 0), scene);
    var light2 = new MYBABY.HemisphericLight("light #2", new MYBABY.Vector3(0, 1, 0), scene);

    nodeMaterial = new MYBABY.NodeMaterial("node");

    // Set to default
    if (!window.location.hash) {
      const mode = MYBABY.DataStorage.ReadNumber("Mode", MYBABY.NodeMaterialModes.Material);

      switch (mode) {
        case MYBABY.NodeMaterialModes.Material:
          nodeMaterial.setToDefault();
          break;
        case MYBABY.NodeMaterialModes.PostProcess:
          nodeMaterial.setToDefaultPostProcess();
          break;
        case MYBABY.NodeMaterialModes.Particle:
          nodeMaterial.setToDefaultParticle();
          break;
        case MYBABY.NodeMaterialModes.ProceduralTexture:
          nodeMaterial.setToDefaultProceduralTexture();
          break;
      }
      nodeMaterial.build(true);

      // document.addEventListener("DOMContentLoaded", function () {
      //   showEditor()
      // });

        setTimeout(function () {
          showEditor();
        }, 1000)

    }
  }
  else {
    alert('Babylon.js is not supported.')
  }

  checkHash();
  return (
    <div style={{width: "100%", height: "100%", padding: "0", margin: "0", overflow: "hidden"}}>
      <div style={{width: "100%", height: "100%", padding: "0", margin: "0", overflow: "hidden"}} id="host-element"></div>
    </div>

  );

}
