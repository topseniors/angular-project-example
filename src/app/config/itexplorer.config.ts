export const ITExplorerConfiguration = {
  "CISearch": [
    {
      "entity": "ProductInstance",
      "label": "App Component",
      "fields": [
        "className",
        "oid",
        "systemClassName",
        "systemOid",
        "systemDescr",
        "shortDescr",
        "type",
        "model",
        "name",
        "manufacturer",
        "description",
        "lastScanDate",
        "expirationDate"
      ],
      "columns": [
        {
          "field": "shortDescr",
          "header": "Label",
          "type": "string",
          "sortable": true
        },
        {
          "field": "systemDescr",
          "header": "Server Name",
          "type": "string",
          "sortable": true
        },
        {
          "field": "type",
          "header": "Type",
          "type": "string",
          "sortable": true
        },
        {
          "field": "model",
          "header": "Model",
          "type": "string",
          "sortable": true
        },
        {
          "field": "name",
          "header": "Name",
          "type": "string",
          "sortable": true
        },
        {
          "field": "manufacturer",
          "header": "Vendor",
          "type": "string",
          "sortable": true
        },
        {
          "field": "description",
          "header": "Description",
          "type": "string",
          "sortable": true
        }
      ],
      "actions": [
        {
          "key": "SEARCH.ACTIONMENU.APP_COMPONENT_DETAILS",
          "target": "ITExplorer",
          "parameters": [
            {
              "param": "className",
              "field": "className"
            },
            {
              "param": "oid",
              "field": "oid"
            },
            {
              "param": "tab",
              "value": "default"
            }
          ]
        },
        {
          "key": "SEARCH.ACTIONMENU.SERVER_DETAILS",
          "target": "ITExplorer",
          "parameters": [
            {
              "param": "className",
              "field": "systemClassName"
            },
            {
              "param": "oid",
              "field": "systemOid"
            },
            {
              "param": "tab",
              "value": "default"
            }
          ]
        }
      ]
    },
    {
      "entity": "NetworkDevice",
      "label": "Network Device",
      "fields": [
        "className",
        "oid",
        "shortDescr",
        "hostName",
        "IPAddressList",
        "model",
        "manufacturer",
        "lastScanDate",
        "expirationDate"
      ],
      "columns": [
        {
          "field": "shortDescr",
          "header": "Label",
          "type": "string",
          "sortable": true
        },
        {
          "field": "hostName",
          "header": "Host Name",
          "type": "string",
          "sortable": true
        },
        {
          "field": "IPAddressList",
          "header": "IP Addresses",
          "type": "string",
          "sortable": true
        },
        {
          "field": "model",
          "header": "Model",
          "type": "string",
          "sortable": true
        },
        {
          "field": "manufacturer",
          "header": "Vendor",
          "type": "string",
          "sortable": true
        },
        {
          "field": "lastScanDate",
          "header": "Last Scanned",
          "type": "datetime",
          "sortable": true
        }
      ],
      "actions": [
        {
          "key": "SEARCH.ACTIONMENU.NETWORK_DEVICE_DETAILS",
          "target": "ITExplorer",
          "parameters": [
            {
              "param": "className",
              "field": "className"
            },
            {
              "param": "oid",
              "field": "oid"
            },
            {
              "param": "tab",
              "value": "default"
            }
          ]
        }
      ]
    },
    {
      "entity": "StorageDevice",
      "label": "Storage Device",
      "fields": [
        "className",
        "oid",
        "shortDescr",
        "hostName",
        "IPAddressList",
        "model",
        "manufacturer",
        "lastScanDate",
        "expirationDate"
      ],
      "columns": [
        {
          "field": "shortDescr",
          "header": "Label",
          "type": "string",
          "sortable": true
        },
        {
          "field": "hostName",
          "header": "Host Name",
          "type": "string",
          "sortable": true
        },
        {
          "field": "IPAddressList",
          "header": "IP Addresses",
          "type": "string",
          "sortable": true
        },
        {
          "field": "model",
          "header": "Model",
          "type": "string",
          "sortable": true
        },
        {
          "field": "manufacturer",
          "header": "Vendor",
          "type": "string",
          "sortable": true
        },
        {
          "field": "lastScanDate",
          "header": "Last Scanned",
          "type": "datetime",
          "sortable": true
        }
      ],
      "actions": [
        {
          "key": "SEARCH.ACTIONMENU.STORAGE_DEVICE_DETAILS",
          "target": "ITExplorer",
          "parameters": [
            {
              "param": "className",
              "field": "className"
            },
            {
              "param": "oid",
              "field": "oid"
            },
            {
              "param": "tab",
              "value": "default"
            }
          ]
        }
      ]
    },
    {
      "entity": "SWCluster",
      "label": "Software Cluster",
      "fields": [
        "className",
        "oid",
        "model",
        "shortDescr",
        "name",
        "serverCount",
        "piCount",
        "creationDate",
        "modificationDate",
        "expirationDate"
      ],
      "columns": [
        {
          "field": "shortDescr",
          "header": "Label",
          "type": "string",
          "sortable": true
        },
        {
          "field": "description",
          "header": "Description",
          "type": "string",
          "sortable": true
        },
        {
          "field": "serverCount",
          "header": "Servers",
          "type": "int",
          "sortable": true
        },
        {
          "field": "piCount",
          "header": "App Components",
          "type": "int",
          "sortable": true
        },
        {
          "field": "creationDate",
          "header": "Created",
          "type": "datetime",
          "sortable": true
        },
        {
          "field": "modificationDate",
          "header": "Updated",
          "type": "datetime",
          "sortable": true
        }
      ],
      "actions": [
        {
          "key": "SEARCH.ACTIONMENU.SOFTWARE_CLUSTER_DETAILS",
          "target": "ITExplorer",
          "parameters": [
            {
              "param": "className",
              "field": "className"
            },
            {
              "param": "oid",
              "field": "oid"
            },
            {
              "param": "tab",
              "value": "default"
            }
          ]
        }
      ]
    },
    {
      "entity": "Application",
      "label": "Application",
      "fields": [
        "className",
        "oid",
        "model",
        "shortDescr",
        "name",
        "serverCount",
        "piCount",
        "expirationDate"
      ],
      "columns": [
        {
          "field": "name",
          "header": "Name",
          "type": "string",
          "sortable": true
        },
        {
          "field": "shortDescr",
          "header": "Label",
          "type": "string",
          "sortable": true
        },
        {
          "field": "description",
          "header": "Description",
          "type": "string",
          "sortable": true
        },
        {
          "field": "serverCount",
          "header": "Servers",
          "type": "int",
          "sortable": true
        },
        {
          "field": "piCount",
          "header": "App Components",
          "type": "int",
          "sortable": true
        }
      ],
      "actions": [
        {
          "key": "SEARCH.ACTIONMENU.APPLICATION_DETAILS",
          "target": "ITExplorer",
          "parameters": [
            {
              "param": "className",
              "field": "className"
            },
            {
              "param": "oid",
              "field": "oid"
            },
            {
              "param": "tab",
              "value": "default"
            }
          ]
        }
      ]
    },
    {
      "entity": "Service",
      "label": "Service",
      "fields": [
        "className",
        "oid",
        "model",
        "shortDescr",
        "name",
        "serverCount",
        "piCount",
        "expirationDate"
      ],
      "columns": [
        {
          "field": "name",
          "header": "Name",
          "type": "string",
          "sortable": true
        },
        {
          "field": "shortDescr",
          "header": "Label",
          "type": "string",
          "sortable": true
        },
        {
          "field": "description",
          "header": "Description",
          "type": "string",
          "sortable": true
        },
        {
          "field": "serverCount",
          "header": "Servers",
          "type": "int",
          "sortable": true
        },
        {
          "field": "piCount",
          "header": "App Components",
          "type": "int",
          "sortable": true
        }
      ],
      "actions": [
        {
          "key": "SEARCH.ACTIONMENU.SERVICE_DETAILS",
          "target": "ITExplorer",
          "parameters": [
            {
              "param": "className",
              "field": "className"
            },
            {
              "param": "oid",
              "field": "oid"
            },
            {
              "param": "tab",
              "value": "default"
            }
          ]
        }
      ]
    },
    {
      "entity": "ComputerSystem",
      "label": "Server",
      "fields": [
        "className",
        "oid",
        "systemType",
        "OSFamily",
        "shortDescr",
        "hostName",
        "VMName",
        "IPAddressList",
        "OSModel",
        "OSVersion",
        "lastScanDate",
        "expirationDate"
      ],
      "columns": [
        {
          "field": "shortDescr",
          "header": "Label",
          "type": "string",
          "sortable": true
        },
        {
          "field": "hostName",
          "header": "Host Name",
          "type": "string",
          "sortable": true
        },
        {
          "field": "VMName",
          "header": "VM Name",
          "type": "string",
          "sortable": true
        },
        {
          "field": "IPAddressList",
          "header": "IP Addresses",
          "type": "string",
          "sortable": true
        },
        {
          "field": "OSModel",
          "header": "Label",
          "type": "string",
          "sortable": true
        },
        {
          "field": "OSVersion",
          "header": "Label",
          "type": "string",
          "sortable": true
        },
        {
          "field": "lastScanDate",
          "header": "Last Scanned",
          "type": "date",
          "sortable": true
        },
        {
          "field": "systemType",
          "header": "System Type",
          "type": "string",
          "sortable": true
        },
        {
          "field": "OSFamily",
          "header": "OS Family",
          "type": "date",
          "sortable": true
        }
      ],
      "actions": [
        {
          "key": "SEARCH.ACTIONMENU.SERVER_DETAILS",
          "target": "ITExplorer",
          "parameters": [
            {
              "param": "className",
              "field": "className"
            },
            {
              "param": "oid",
              "field": "oid"
            },
            {
              "param": "tab",
              "value": "default"
            }
          ]
        }
      ]
    },
    {
      "entity": "All",
      "label": "All",
      "fields": [
        "className",
        "oid",
        "systemClassName",
        "systemOid",
        "shortDescr",
        "expirationDate"
      ],
      "columns": [
        {
          "field": "className",
          "header": "CI Class",
          "type": "string",
          "sortable": true
        },
        {
          "field": "shortDescr",
          "header": "Label",
          "type": "string",
          "sortable": true
        }
      ],
      "actions": []
    }
  ],
  "ChangeSearch": {}
};

export const SearchTypes = [{
  label: 'CI Search',
  value: 'CISearch'
}/*, {
 label: 'Change Search',
 value: 'ChangeSearch'
 }*/];

export const EntityTypes = [{
  label: 'All',
  plural: 'All',
  value: 'All'
}, {
  label: 'App Component',
  plural: 'App Components',
  value: 'ProductInstance'
}, {
  label: 'Server',
  plural: 'Servers',
  value: 'ComputerSystem'
}, {
  label: 'Network Device',
  plural: 'Network Devices',
  value: 'NetworkDevice'
}, {
  label: 'Storage Device',
  plural: 'Storage Devices',
  value: 'StorageDevice'
}, {
  label: 'Software Cluster',
  plural: 'Software Clusters',
  value: 'SWCluster'
}, {
  label: 'Application',
  plural: 'Applications',
  value: 'Application'
}, {
  label: 'Service',
  plural: 'Services',
  value: 'Service'
}];
