import React, { useState, useEffect } from 'react';
import Favicon from "react-favicon";
import logo from './logo.png';

import './App.css';



const allowed_genome = [
    "hg38", "hg19",
    "panTro4", "panTro5", "panTro6",
    "gorGor3", "gorGor4",

    "nomLeu3",
    "papAnu2",
    "rheMac2", "rheMac3", "rheMac8", "rheMac10",

    "calJac3", "calJac4",
    "bosTau8",
    "oviAri4",

    "susScr3", "susScr11",
    "oryCun2",
    "canFam2", "canFam3",

    "mm9", "mm10", "mm39",
    "rn4", "rn6", "rn7",
    "monDom5",

    "galGal5", "galGal6",
    "xenTro10",
    "danRer7", "danRer10", "danRer11",

    "sacCer3",

]

const trackTypes = {
    "bigwig": "BigWig",
    "dynseq": "dynseq",
    "methylc": "methylC",
    "longrange": "longrange",
    "biginteract": "biginteract",
    "repeatmasker": "repeatmasker",
    "geneAnnotation": "Gene Annotation",

    "bigbed": "BigBed",
    "bed": "bed",
    "refbed": "refbed",
    "qbed": "qbed",

    "hic": "Hi-C",
    "cool": "cool",
    "genomealign": "Genome Align",
    "matplot": "matplot",
    "g3d": "g3d",


    // "": "",
}


const trackTypeShort2Full = {
    "bw": "bigwig",
    "bb": "bigbed",
    "ga": "genomealign",

    // "": "",
}


const trackTypeOptions = {}
for (let trackType in trackTypes) {
    trackTypeOptions[trackType] = undefined;
}

trackTypeOptions["methylc"] = {
    "options": {
    "label": "Methylation",
    "colorsForContext": {
      "CG": { "color": "#648bd8", "background": "#d9d9d9" },
      "CHG": { "color": "#ff944d", "background": "#ffe0cc" },
      "CHH": { "color": "#ff00ff", "background": "#ffe5ff" }
    },
    "depthColor": "#01E9FE"
  }
}


trackTypeOptions["refbed"] = {
    "options": {
        "categoryColors": {
            "coding": "rgb(101,1,168)",
            "nonCoding": "rgb(1,193,75)",
            "pseudo": "rgb(230,0,172)",
            "problem": "rgb(224,2,2)",
            "other":"rgb(128,128,128)"
        }
    }
}


trackTypeOptions["hic"] = {
    "options": {
        "displayMode": "arc"
    }
}

trackTypeOptions["cool"] = {
    "options": {
        "displayMode": "arc"
    }
}

trackTypeOptions["genomealign"] = {
    "metadata": {
        "genome": "ind"
    }
}

trackTypeOptions["qbed"] = {
    "options":{
        "color":"#D12134",
        "logScale":"log10",
        "show":"sample",
        "sampleSize":1000,
        "markerSize":5,
        "opacity":[50],
      }
}



trackTypeOptions[""] = {

}

const apiEndpoint = "https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/"





function fileDataToDatahubJson(fileData) {
    let datahubJson = [];

    for (let i = 0; i < fileData.length; i++) {
        const data0 = fileData[i];

        const dh0 = {
            "type": data0.dataType,
            "name": data0.name,
            "url": data0.fileURL,
            "showOnHubLoad": true,
            "options": {
                "height": 100
            }
        };

        const trackTypeSpecificOptions = trackTypeOptions[data0.dataType];
        if (trackTypeSpecificOptions !== undefined) {
            // console.log(trackTypeSpecificOptions);
            for (let key in trackTypeSpecificOptions) {
                if (key === "options") {
                    for (let key2 in trackTypeSpecificOptions[key]) {
                        dh0[key][key2] = trackTypeSpecificOptions[key][key2];
                    }
                }
                else {
                    dh0[key] = trackTypeSpecificOptions[key];
                }

            }
        }

        if (data0.trackHeight !== undefined) {
            dh0.options.height = data0.trackHeight;
        }


        datahubJson.push(dh0);
    }
    return datahubJson;
}



function randomString(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function randomID() {
    return randomString(30);
}

function sendDatahubJsonToServer(datahubJson, rid, regenerate) {
    const d = {
        "_id": rid,
        "hub": {
            "content": datahubJson
        }
    }

    if (regenerate === true) {
        fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(d),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    


    return apiEndpoint + rid;
      
}




function DownloadJsonButton({fileData, genome, regenerate, datahubID}) {
    // console.clear()

    let datahubJson = fileDataToDatahubJson(fileData);
    let dh_url = sendDatahubJsonToServer(datahubJson, datahubID, regenerate);
    let browser_url = "https://epigenomegateway.wustl.edu/browser/?genome=" + genome + "&hub=" + dh_url;



    const handleDownload = () => {
        const jsonString = JSON.stringify(datahubJson, null, 2);

        const blob = new Blob([jsonString], { type: 'application/json' });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = "datahub.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    };

    const debugReturn = () => {
        console.log("fileData", fileData);
        console.log("fileDataToDatahubJson(fileData)", fileDataToDatahubJson(fileData));
    }

    let returnEle = (
        <button onClick={handleDownload}>
        Download
        </button>
    );

    

    returnEle = (
        <div>

            <div onClick={() => {window.open(browser_url, "_blank")}} className="button button-primary">
                WashU Epigenome Browser
            </div>

            <div onClick={handleDownload} className="button button-primary">
                Download your datahub
            </div>


        </div>
    )

    return returnEle;
}





function DatahubFileUrls() {

    const exampleData = {
        name: "hg38.bigwig",

        fileURL: "https://wangftp.wustl.edu/~wzhang/bigwig/hg38.bigwig",


        dataType: "bigwig",
        userProvidedDataType: false,
        assumedDataType: "bigwig",

        trackHeight: 50,
    };



    const [fileData, setFileData] = useState([exampleData]);
    const [genome, setGenome] = useState("hg38");
    const [gdhc, setGdhc] = useState(0);
    const [regenerateFlag, setRegenerateFlag] = useState(false);
    const [datahubID, setDatahubID] = useState(randomID());



    const setFileDataAtomic = (index, name, value) => {
        const newFileData = [...fileData];
        newFileData[index][name] = value;
        validateUserInput(newFileData);
    }

    const addFileData = () => {
        validateUserInput([...fileData, JSON.parse(JSON.stringify(exampleData))]);
    }



    const validateUserInput = (input) => {


        for (let i = 0; i < fileData.length; i++) {
            const data0 = input[i];

            if (data0.userProvidedDataType === false) {
                const d0url = data0.fileURL.toLowerCase();
                const fileName = d0url.split('/').pop();
                const fileExtension = fileName.split('.').pop();

                if (Object.keys(trackTypes).includes(fileExtension)) {
                    // console.log("trackTypes", fileName);
                    data0.assumedDataType = fileExtension;
                }
                else if (Object.keys(trackTypeShort2Full).includes(fileExtension)) {
                    data0.assumedDataType = trackTypeShort2Full[fileExtension];
                }
                // console.log("data0.assumedDataType", fileName);
            }


            if (data0.userProvidedDataType !== false) {
                data0.dataType = data0.userProvidedDataType;
            }
            else {
                data0.dataType = data0.assumedDataType;
            }
        }

        setFileData(input)
    }

    function Step2Button () {
        return (
            <div onClick={() => {setGdhc(gdhc + 1); setRegenerateFlag(true); setDatahubID(randomID())}} className="button button-primary" >
                {gdhc > 0 ? "Update" : "Generate"} datahub.json
            </div>
        );
    }


    return (
        <div>

            <div>
                <h1>Step 1: Provide your track URL and metadata</h1>
            </div>

            <div>

                <div>
                    <label>Genome: </label>
                    <select
                        value={allowed_genome.dataType}
                        onChange={(e) => setGenome(e.target.value)}
                    >
                        {Object.keys(allowed_genome).map((ag) => {
                            return (
                                <option value={allowed_genome[ag]} key={allowed_genome[ag]}>{allowed_genome[ag]}</option>
                            );
                        })}
                    </select>
                    
                </div>
                <br></br>


                <table className={"input_data_table"}>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Label</th>
                            <th>URL</th>
                            <th>Track type</th>
                            <th>Height</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {fileData.map(
                            (data0, index) => {
                            return (
                                <tr key={index}>
                                    <td style={{"width": "20px"}}>
                                        {index+1}
                                    </td>
                                    <td style={{"width": "120px"}}>
                                        <input type={"text"}
                                               value={data0.name}
                                               className="input_text"
                                               onChange={(e) => setFileDataAtomic(index, "name", e.target.value)}
                                        />
                                    </td>
                                    <td >
                                        <input type={"text"}
                                               value={data0.fileURL}
                                               className="input_text"
                                               onChange={(e) => setFileDataAtomic(index, "fileURL", e.target.value)}
                                        />
                                    </td>
                                    <td style={{"width": "130px"}}>
                                        <select
                                            value={data0.dataType}
                                            className="input_dropdown"
                                            onChange={(e) => setFileDataAtomic(index, "userProvidedDataType", e.target.value)}
                                        >
                                            {Object.keys(trackTypes).map((trackType) => {
                                                return (
                                                    <option value={trackType} key={trackType}>{trackTypes[trackType]}</option>
                                                );
                                            })}
                                        </select>
                                    </td>
                                    <td style={{"width": "70px"}}>
                                        <input type={"text"}
                                               value={data0.trackHeight}
                                               className="input_text"
                                               onChange={(e) => setFileDataAtomic(index, "trackHeight", e.target.value)}
                                        />
                                    </td>
                                    <td style={{"width": "15px", "textAlign": "center"}}>
                                        <button
                                            className={"remove_button"}
                                            onClick={() => {
                                                const newFileData = [...fileData];
                                                newFileData.splice(index, 1);
                                                setFileData(newFileData);
                                            }}
                                        >X</button>
                                    </td>
                                </tr>
                            );
                        })}

                    </tbody>


                </table>
                <div onClick={addFileData} className="button button-primary">Add more data</div>
            </div>

            <div>
                <h1>Step 2: Generate datahub.json</h1>
                <Step2Button />
            </div>

            {gdhc > 0 ? (
                <div>
                    <h1>Step 3: View on the browser, or download your datahub</h1>
                    <DownloadJsonButton className="button button-primary"
                        fileData={fileData}
                        genome={genome}
                        regenerate={regenerateFlag}
                        datahubID={datahubID}
                    ></DownloadJsonButton>
                </div>
            ) : null}

            


        </div>
    )
}



function DHHMain() {
    useEffect(() => {
        document.title = "Datahub Helper"; // Change this to your desired title
    }, []);

    return (
        <div className='wrapper'>
            <Favicon url={logo} />
            <div className='header'>
                <img src={logo} alt="Logo" className='logo' />
                Datahub Helper
            </div>
            <DatahubFileUrls className='content'></DatahubFileUrls>
            <div className='footer'>
                <span>Developed by the <a href="https://wang.wustl.edu/">Wang Lab</a></span>
                <a href="https://epigenomegateway.wustl.edu/browser/LICENSE.html">Terms and Conditions of Use</a>
            </div>
        </div>
    );
}



export default DHHMain;
