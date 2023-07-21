export const SearchConfiguration = {
  'CISearch': [
    {
      'entity': 'ProductInstance',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.PRODUCT_INSTANCE',
      'highlighting': false,
      'fields': [
        'className',
        'oid',
        'systemClassName',
        'systemOid',
        'systemDescr',
        'shortDescr',
        'type',
        'model',
        'name',
        'manufacturer',
        'description',
        'creationDate',
        'modificationDate',
        'lastScanDate',
        'expirationDate'
      ],
      'columns': [
        {
          'field': 'shortDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SHORTDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'systemDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SYSTEMDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'type',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.TYPE',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'model',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.MODEL',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'name',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.NAME',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'manufacturer',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.MANUFACTURER',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'description',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.DESCRIPTION',
          'type': 'string',
          'sortable': true
        }
      ],
      'facets': [
        {
          'field': 'type',
          'header': 'SEARCH.DO_SEARCH.FACET_LABELS.SOFTWARE_TYPE',
          'values': {}
        },
        {
          'field': 'manufacturer',
          'header': 'SEARCH.DO_SEARCH.FACET_LABELS.MANUFACTURER',
          'values': {}
        }
      ],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.APP_COMPONENT_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'className'
            },
            {
              'param': 'oid',
              'field': 'oid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        },
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.SERVER_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'systemClassName'
            },
            {
              'param': 'oid',
              'field': 'systemOid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        }
      ]
    },
    {
      'entity': 'UnqualifiedPI',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.UNQUALIFIED_PI',
      'highlighting': false,
      'fields': [
        'className',
        'oid',
        'systemClassName',
        'systemOid',
        'systemDescr',
        'shortDescr',
        'name',
        'creationDate',
        'modificationDate'
      ],
      'columns': [
        {
          'field': 'shortDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SHORTDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'systemDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SYSTEMDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'name',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.NAME',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'creationDate',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CREATIONDATE',
          'type': 'datetime',
          'sortable': true
        },
        {
          'field': 'modificationDate',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.MODIFICATIONDATE',
          'type': 'datetime',
          'sortable': true
        }
      ],
      'facets': [],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.FOUND_APP_COMPONENT_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'className'
            },
            {
              'param': 'oid',
              'field': 'oid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        },
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.SERVER_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'systemClassName'
            },
            {
              'param': 'oid',
              'field': 'systemOid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        }
      ]
    },
    {
      'entity': 'UnqualifiedPIGroup',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.UNQUALIFIED_PI_GROUP',
      'highlighting': false,
      'fields': [
        'className',
        'oid',
        'model',
        'shortDescr',
        'name',
        'serverCount',
        'containerCount',
        'creationDate',
        'modificationDate',
        'expirationDate'
      ],
      'columns': [
        {
          'field': 'shortDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SHORTDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'description',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.DESCRIPTION',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'serverCount',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SERVERCOUNT',
          'type': 'int',
          'sortable': true
        },
        {
          'field': 'containerCount',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CONTAINERCOUNT',
          'type': 'int',
          'sortable': true
        },
        {
          'field': 'creationDate',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CREATIONDATE',
          'type': 'datetime',
          'sortable': true
        },
        {
          'field': 'modificationDate',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.MODIFICATIONDATE',
          'type': 'datetime',
          'sortable': true
        }
      ],
      'facets': [ ],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.FOUND_APPLICATION_GROUP_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'className'
            },
            {
              'param': 'oid',
              'field': 'oid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        }
      ]
    },
    {
      'entity': 'SWCluster',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.SW_CLUSTER',
      'highlighting': false,
      'fields': [
        'className',
        'oid',
        'model',
        'shortDescr',
        'name',
        'serverCount',
        'containerCount',
        'piCount',
        'creationDate',
        'modificationDate',
        'expirationDate'
      ],
      'columns': [
        {
          'field': 'shortDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SHORTDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'description',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.DESCRIPTION',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'serverCount',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SERVERCOUNT',
          'type': 'int',
          'sortable': true
        },
        {
          'field': 'containerCount',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CONTAINERCOUNT',
          'type': 'int',
          'sortable': true
        },
        {
          'field': 'piCount',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.PICOUNT',
          'type': 'int',
          'sortable': true
        },
        {
          'field': 'creationDate',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CREATIONDATE',
          'type': 'datetime',
          'sortable': true
        },
        {
          'field': 'modificationDate',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.MODIFICATIONDATE',
          'type': 'datetime',
          'sortable': true
        }
      ],
      'facets': [ ],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.SOFTWARE_CLUSTER_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'className'
            },
            {
              'param': 'oid',
              'field': 'oid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        }
      ]
    },
    {
      'entity': 'BusinessService',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.BUSINESS_SERVICE',
      'highlighting': false,
      'fields': [
        'className',
        'oid',
        'shortDescr',
        'name',
        'creationDate',
        'modificationDate'
      ],
      'columns': [
        {
          'field': 'name',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.NAME',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'shortDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SHORTDESCR',
          'type': 'string',
          'sortable': true
        }
      ],
      'facets': [ ],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.BUSINESS_SERVICE_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'className'
            },
            {
              'param': 'oid',
              'field': 'oid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        }
      ]
    },
    {
      'entity': 'Service',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.SERVICE',
      'highlighting': false,
      'fields': [
        'className',
        'oid',
        'model',
        'shortDescr',
        'name',
        'serverCount',
        'piCount',
        'containerCount',
        'creationDate',
        'modificationDate',
        'expirationDate'
      ],
      'columns': [
        {
          'field': 'name',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.NAME',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'shortDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SHORTDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'description',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.DESCRIPTION',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'serverCount',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SERVERCOUNT',
          'type': 'int',
          'sortable': true
        },
        {
          'field': 'containerCount',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CONTAINERCOUNT',
          'type': 'int',
          'sortable': true
        },
        {
          'field': 'piCount',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.PICOUNT',
          'type': 'int',
          'sortable': true
        }
      ],
      'facets': [ ],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.SERVICE_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'className'
            },
            {
              'param': 'oid',
              'field': 'oid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        }
      ]
    },
    {
      'entity': 'ComputerSystem',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.COMPUTER_SYSTEM',
      'highlighting': false,
      'fields': [
        'className',
        'oid',
        'systemType',
        'OSFamily',
        'shortDescr',
        'hostName',
        'VMName',
        'IPAddressList',
        'OSModel',
        'OSVersion',
        'lastScanDate',
        'creationDate',
        'modificationDate',
        'expirationDate'
      ],
      'columns': [
        {
          'field': 'shortDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SHORTDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'hostName',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.HOSTNAME',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'VMName',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.VMNAME',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'IPAddressList',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.IPADDRESSLIST',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'OSModel',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.OSMODEL',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'OSVersion',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.OSVERSION',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'lastScanDate',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.LASTSCANDATE',
          'type': 'date',
          'sortable': true
        }
      ],
      'facets': [
        {
          'field': 'systemType',
          'header': 'SEARCH.DO_SEARCH.FACET_LABELS.SYSTEM_TYPE',
          'values': {
            'CloudInstance': 'Cloud Instance',
            'Virtual': 'Virtual Machine',
            'Physical': 'Physical Machine',
            'VIHost': 'Virtualization Machine'
          }
        },
        {
          'field': 'OSFamily',
          'header': 'SEARCH.DO_SEARCH.FACET_LABELS.OS_FAMILY',
          'values': {
            'Windows': 'Windows',
            'Unix': 'Unix',
            'Linux': 'Linux',
            'Virtualization': 'Virtualization'
          }
        }
      ],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.SERVER_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'className'
            },
            {
              'param': 'oid',
              'field': 'oid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        }
      ]
    },
    {
      'entity': 'Container',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.CONTAINER',
      'highlighting': false,
      'fields': [
        'className',
        'oid',
        'systemClassName',
        'systemOid',
        'systemDescr',
        'shortDescr',
        'hostName',
        'containerName',
        'IPAddressList',
        'containerTechnology',
        'lastScanDate',
        'creationDate',
        'modificationDate',
        'expirationDate'
      ],
      'columns': [
        {
          'field': 'shortDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SHORTDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'hostName',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.HOSTNAME',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'containerName',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CONTAINERNAME',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'systemDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SYSTEMDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'IPAddressList',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.IPADDRESSLIST',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'containerTechnology',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CONTAINERTECHNOLOGY',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'lastScanDate',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.LASTSCANDATE',
          'type': 'date',
          'sortable': true
        }
      ],
      'facets': [],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.SERVER_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'systemClassName'
            },
            {
              'param': 'oid',
              'field': 'systemOid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        }
      ]
    },
    {
      'entity': 'SystemProcessList',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.SYSTEM_PROCESS_LIST',
      'highlighting': true,
      'fields': [
        'className',
        'oid',
        'systemClassName',
        'systemOid',
        'systemDescr',
        'processList',
        'expirationDate'
      ],
      'columns': [
        {
          'field': 'systemDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SYSTEMDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'processList',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.PROCESSLIST',
          'type': 'string',
          'sortable': false
        }
      ],
      'facets': [],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.SERVER_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'systemClassName'
            },
            {
              'param': 'oid',
              'field': 'systemOid'
            },
            {
              'param': 'tab',
              'value': 'processes'
            }
          ]
        }
      ]
    },
    {
      'entity': 'SystemProcessCxList',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.SYSTEM_PROCESS_CX_LIST',
      'highlighting': true,
      'fields': [
        'className',
        'oid',
        'systemClassName',
        'systemOid',
        'systemDescr',
        'cxList',
        'expirationDate'
      ],
      'columns': [
        {
          'field': 'systemDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SYSTEMDESCR',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'cxList',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CXLIST',
          'type': 'string',
          'sortable': false
        }
      ],
      'facets': [],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.SERVER_DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'systemClassName'
            },
            {
              'param': 'oid',
              'field': 'systemOid'
            },
            {
              'param': 'tab',
              'value': 'processcx'
            }
          ]
        }
      ]
    },
    {
      'entity': 'All',
      'label': 'SEARCH.DO_SEARCH.ENTITY_LABELS.ALL',
      'highlighting': true,
      'fields': [
        'className',
        'oid',
        'systemClassName',
        'systemOid',
        'shortDescr',
        'creationDate',
        'modificationDate',
        'expirationDate'
      ],
      'columns': [
        {
          'field': 'className',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.CLASSNAME',
          'type': 'string',
          'sortable': true
        },
        {
          'field': 'shortDescr',
          'header': 'SEARCH.DO_SEARCH.COLUMNS.SHORTDESCR',
          'type': 'string',
          'sortable': true
        }
      ],
      'facets': [
        {
          'field': 'className',
          'header': 'SEARCH.DO_SEARCH.FACET_LABELS.CLASS_NAME',
          'values': {}
        }
      ],
      'actions': [
        {
          'key': 'SEARCH.DO_SEARCH.ACTIONMENU.DETAILS',
          'target': 'ITExplorer',
          'parameters': [
            {
              'param': 'className',
              'field': 'className'
            },
            {
              'param': 'oid',
              'field': 'oid'
            },
            {
              'param': 'tab',
              'value': 'default'
            }
          ]
        }
      ]
    }
  ],
  'ChangeSearch': {}
};

export const SearchTypes = [{
  label: 'SEARCH.DO_SEARCH.SEARCH_TYPES.CI_SEARCH',
  value: 'CISearch'
}/*, {
 label: 'SEARCH.DO_SEARCH.SEARCH_TYPES.CHANGE_SEARCH',
 value: 'ChangeSearch'
 }*/];

export const EntityTypes = [{
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.ALL',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.ALL',
  value: 'All',
  extendITU: false
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.PRODUCT_INSTANCE',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.PRODUCT_INSTANCE_PLURAL',
  value: 'ProductInstance',
  extendITU: true
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.COMPUTER_SYSTEM',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.COMPUTER_SYSTEM_PLURAL',
  value: 'ComputerSystem',
  extendITU: true
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.CONTAINER',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.CONTAINER_PLURAL',
  value: 'Container',
  extendITU: true
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.SYSTEM_PROCESS_LIST',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.SYSTEM_PROCESS_LIST_PLURAL',
  value: 'SystemProcessList',
  extendITU: false
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.UNQUALIFIED_PI',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.UNQUALIFIED_PI_PLURAL',
  value: 'UnqualifiedPI',
  extendITU: true
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.UNQUALIFIED_PI_GROUP',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.UNQUALIFIED_PI_GROUP_PLURAL',
  value: 'UnqualifiedPIGroup',
  extendITU: true
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.SW_CLUSTER',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.SW_CLUSTER_PLURAL',
  value: 'SWCluster',
  extendITU: true
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.BUSINESS_SERVICE',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.BUSINESS_SERVICE_PLURAL',
  value: 'BusinessService',
  extendITU: true
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.SERVICE',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.SERVICE_PLURAL',
  value: 'Service',
  extendITU: true
}, {
  label: 'SEARCH.DO_SEARCH.ENTITY_LABELS.SYSTEM_PROCESS_CX_LIST',
  plural: 'SEARCH.DO_SEARCH.ENTITY_LABELS.SYSTEM_PROCESS_CX_LIST_PLURAL',
  value: 'SystemProcessCxList',
  extendITU: false
}];
