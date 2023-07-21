import { Injectable } from '@angular/core';
import { ApiService, APIResult, StringableCollection } from './api.service';
import { Observable, Subject } from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { WebSocketService } from '../websocket.service';
import { ToastrService } from '../toastr.service';
import { AuthService } from '../auth.service';

export type APIResult<T> = APIResult<T>;
export type GetSyncSystemsAPIResult = SyncSystem[];
export type GetSyncSystemAPIResult = SyncSystem;
export type GetSyncSystemHealthAPIResult = SyncSystemHealth;
export type GetSyncSystemsIntegrationsAPIResult = APIResult<SyncSystemIntegration>;
export type GetSyncSystemIntegrationAPIResult = SyncSystemIntegration;
export type GetSyncSystemLogsAPIResult = APIResult<SyncSystemLog>;

export interface WebSocketMessage {
  change?: string;
  className?: string;
  errorCode?: number;
  errorInfo?: string;
  oid?: string;
  status?: string;
  systemName?: string;
  tenant?: string;
  timestamp?: number;
}

export const newSyncSystemBase = {
  login: {
    path: '',
    user: '',
    password: '',
    org: ''
  },
  relationsFilter: {
    type: 'BlackList',
    classes: []
  },
  nodeFilter: {
    type: 'BlackList',
    classes: []
  },
  mappings: {
    nodeMappings: [
      {
        nodeName: 'ComputerSystem',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_devices_hadm',
        directMapping: [
          {
            toField: 'u_correlationid',
            fromField: 'className:oid'
          },
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_location',
            fromField: 'locationName'
          },
          {
            toField: 'u_product',
            fromField: 'OSFamily'
          },
          {
            toField: 'u_os_version',
            fromField: 'OSModel'
          },
          {
            toField: 'u_operating_system',
            fromField: 'OSVersion'
          },
          {
            toField: 'u_cpu_count',
            fromField: 'nbOfCPUs'
          },
          {
            toField: 'u_cpu_name',
            fromField: 'CPUModel'
          },
          {
            toField: 'u_cpumanufacturer',
            fromField: 'CPUManufacturer'
          },
          {
            toField: 'u_discovery_source',
            fromField: 'N/A'
          },
          {
            toField: 'u_dns_domain',
            fromField: 'discoveryIPDNSName'
          },
          {
            toField: 'u_ipaddress',
            fromField: 'IPAddressList'
          },
          {
            toField: 'u_mac_address',
            fromField: '???'
          },
          {
            toField: 'u_name',
            fromField: 'HostName'
          },
          {
            toField: 'u_os_service_pack',
            fromField: 'N/A'
          },
          {
            toField: 'u_serialnumber',
            fromField: 'serialNumber'
          },
          {
            toField: 'u_max_cpu_speed__mhz_',
            fromField: 'CPUMaxSpeed'
          }
        ],
        multiplyMapping: [
          {
            toField: 'u_cpu_core_count',
            fields: [
              'nbOfCPU',
              'nbOfCoresPerCPU'
            ]
          }
        ],
        divideMapping: [
          {
            toField: 'u_disk_space_in_gbs',
            fields: [
              'totalLocalDiskCapacity',
              '1073741824'
            ]
          },
          {
            toField: 'u_ram__mb_',
            fields: [
              'totalPhysicalMemory',
              '1048576'
            ]
          }
        ],
        toBooleanMapping: [
          {
            toField: 'u_is_virtual',
            fieldToCompare: 'systemType',
            valueToCompare: 'Virtual'
          }
        ],
        toDateMapping: [
          {
            toField: 'u_lastseendate',
            fromField: 'lastScanDate'
          }
        ]
      },
      {
        nodeName: 'ProductInstance',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_application_software_hadm',
        directMapping: [
          {
            toField: 'u_correlationid',
            fromField: 'className:oid'
          },
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_servicenowtargetclass',
            fromField: 'Model'
          },
          {
            toField: 'u_name',
            fromField: 'displayName'
          },
          {
            toField: 'u_domain',
            fromField: ''
          },
          {
            toField: 'u_softwareversion',
            fromField: 'productVersion'
          },
          {
            toField: 'u_softwareedition',
            fromField: ''
          },
          {
            toField: 'u_configurationdirectory',
            fromField: 'ConfigPath'
          },
          {
            toField: 'u_providedbydevcorrelationid',
            fromField: 'className:oid'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      },
      {
        nodeName: 'Application',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_business_service_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_id',
            fromField: 'className:oid'
          },
          {
            toField: 'u_importance',
            fromField: 'Importance'
          },
          {
            toField: 'u_name',
            fromField: 'name'
          },
          {
            toField: 'u_manufacturer',
            fromField: 'manufacturer'
          },
          {
            toField: 'u_versionNumber',
            fromField: 'versionumber'
          },
          {
            toField: 'u_location',
            fromField: 'location'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      },
      {
        nodeName: 'Service',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_business_service_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_id',
            fromField: 'className:oid'
          },
          {
            toField: 'u_name',
            fromField: 'name'
          },
          {
            toField: 'u_manufacturer',
            fromField: 'manufacturer'
          },
          {
            toField: 'u_versionNumber',
            fromField: 'model'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      },
      {
        nodeName: 'NetworkDevice',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_network_devices_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_ido_cn',
            fromField: 'className'
          },
          {
            toField: 'u_ido_oid',
            fromField: 'className:oid'
          },
          {
            toField: 'u_ido_orgoid',
            fromField: 'orgOid'
          },
          {
            toField: 'u_properties_ipaddresslist',
            fromField: 'IPAddressList'
          },
          {
            toField: 'u_properties_manufacturer',
            fromField: 'manufacturer'
          },
          {
            toField: 'u_properties_model',
            fromField: 'model'
          },
          {
            toField: 'u_properties_name',
            fromField: 'name'
          },
          {
            toField: 'u_properties_osmodel',
            fromField: 'OSModel'
          },
          {
            toField: 'u_properties_serialnumber',
            fromField: 'serialNumber'
          },
          {
            toField: 'u_properties_shortdescr',
            fromField: 'IPAddressList'
          },
          {
            toField: 'u_properties_snmpsystemname',
            fromField: 'SNMPSystemName'
          },
          {
            toField: 'u_properties_snmpsystemoid',
            fromField: 'SNMPSystemOid'
          },
          {
            toField: 'u_properties_systemtype',
            fromField: 'systemType'
          },
          {
            toField: 'u_properties_type',
            fromField: 'type'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      },
      {
        nodeName: 'FCPort',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_storage_fibre_channel_port_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_ido_oid',
            fromField: 'className:oid'
          },
          {
            toField: 'u_properties_fcporttype',
            fromField: 'FCPortType'
          },
          {
            toField: 'u_properties_portname',
            fromField: 'portName'
          },
          {
            toField: 'u_properties_address',
            fromField: 'address'
          },
          {
            toField: 'u_properties_addresstype',
            fromField: 'addresstype'
          },
          {
            toField: 'u_properties_shortdescr',
            fromField: 'shortdescr'
          },
          {
            toField: 'u_properties_maxspeed',
            fromField: 'maxSpeed'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      },
      {
        nodeName: 'NetworkPort',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_network_port_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_ido_cn',
            fromField: 'className'
          },
          {
            toField: 'u_ido_oid',
            fromField: 'className:oid'
          },
          {
            toField: 'u_ido_orgoid',
            fromField: 'orgOid'
          },
          {
            toField: 'u_properties_autosense',
            fromField: 'autosense'
          },
          {
            toField: 'u_properties_macaddress',
            fromField: 'mac'
          },
          {
            toField: 'u_properties_maxspeed',
            fromField: 'maxspeed'
          },
          {
            toField: 'u_properties_c_ctedmacaddress',
            fromField: 'macid'
          },
          {
            toField: 'u_properties_fullduplex',
            fromField: 'fullduplex'
          },
          {
            toField: 'u_properties_operationalstatus',
            fromField: 'operationalStatus'
          },
          {
            toField: 'u_properties_shortdescr',
            fromField: 'shortDescr'
          },
          {
            toField: 'u_properties_adminstatus',
            fromField: 'adminStatus'
          },
          {
            toField: 'u_properties_vlans',
            fromField: 'VLANs'
          },
          {
            toField: 'u_properties_s_sicalportindex',
            fromField: 'SNMPPhysicalPortIndex'
          },
          {
            toField: 'u_properties_snmpportindex',
            fromField: 'SNMPPortIndex'
          },
          {
            toField: 'u_properties_connectedportinfo',
            fromField: 'connectedPortInfo'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      },
      {
        nodeName: 'StorageDevice',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_storage_lun_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_ido_orgoid',
            fromField: 'orgOid'
          },
          {
            toField: 'u_ido_cn',
            fromField: 'className'
          },
          {
            toField: 'u_ido_oid',
            fromField: 'className:oid'
          },
          {
            toField: 'u_properties_ipaddresslist',
            fromField: 'IPAddressList'
          },
          {
            toField: 'u_name',
            fromField: 'name'
          },
          {
            toField: 'u_properties_nodewwn',
            fromField: 'nodeWWN'
          },
          {
            toField: 'u_properties_oid',
            fromField: 'className:oid'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: [
          {
            toField: 'u_properties_lastscandate',
            fromField: 'lastScanDate'
          }
        ]
      },
      {
        nodeName: 'StoragePool',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_storage_pool_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_ido_orgoid',
            fromField: 'orgOid'
          },
          {
            toField: 'u_ido_cn',
            fromField: 'className'
          },
          {
            toField: 'u_ido_oid',
            fromField: 'className:oid'
          },
          {
            toField: 'u_properties_elementid',
            fromField: 'elementId'
          },
          {
            toField: 'u_properties_isprimordial',
            fromField: 'isPrimordial'
          },
          {
            toField: 'u_properties_poolid',
            fromField: 'poolID'
          },
          {
            toField: 'u_properties_r_ngmanagedspace',
            fromField: 'remainingManagedSpace'
          },
          {
            toField: 'u_properties_shortdescr',
            fromField: 'shortDescr'
          },
          {
            toField: 'u_properties_systemid',
            fromField: 'systemId'
          },
          {
            toField: 'u_properties_totalmanagedspace',
            fromField: 'totalManagedSpace'
          },
          {
            toField: 'u_properties_usage',
            fromField: 'usage'
          },
          {
            toField: 'u_properties_oid',
            fromField: 'id'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      },
      {
        nodeName: 'RAIDGroup',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_storage_raid_group_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_ido_oid',
            fromField: 'className:oid'
          },
          {
            toField: 'u_ido_cn',
            fromField: 'className'
          },
          {
            toField: 'u_ido_orgoid',
            fromField: 'orgOid'
          },
          {
            toField: 'u_properties_consumableblocks',
            fromField: 'consumableBlocks'
          },
          {
            toField: 'u_properties_dataredundancy',
            fromField: 'dataRedundancy'
          },
          {
            toField: 'u_properties_elementid',
            fromField: 'elementId'
          },
          {
            toField: 'u_properties_isprimordial',
            fromField: 'isPrimordial'
          },
          {
            toField: 'u_properties_nospof',
            fromField: 'noSPOF'
          },
          {
            toField: 'u_properties_numberofblocks',
            fromField: 'numberOfBlocks'
          },
          {
            toField: 'u_properties_systemid',
            fromField: 'systemId'
          },
          {
            toField: 'u_properties_blocksize',
            fromField: 'defaultBlockSize'
          },
          {
            toField: 'u_properties_oid',
            fromField: 'className:oid'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      },
      {
        nodeName: 'StorageVolume',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_storage_lun_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_ido_oid',
            fromField: 'className:oid'
          },
          {
            toField: 'u_ido_cn',
            fromField: 'className'
          },
          {
            toField: 'u_ido_orgoid',
            fromField: 'orgOid'
          },
          {
            toField: 'u_properties_blocksize',
            fromField: 'defaultBlockSize'
          },
          {
            toField: 'u_properties_elementid',
            fromField: 'elementId'
          },
          {
            toField: 'u_properties_lun',
            fromField: 'LUN'
          },
          {
            toField: 'u_properties_lunidentifier',
            fromField: 'LUNIdentifier'
          },
          {
            toField: 'u_properties_shortdescr',
            fromField: 'shortDescr'
          },
          {
            toField: 'u_properties_systemid',
            fromField: 'systemId'
          },
          {
            toField: 'u_properties_usage',
            fromField: 'usage'
          },
          {
            toField: 'u_properties_nbofblocks',
            fromField: 'numberOfBlocks'
          },
          {
            toField: 'u_properties_sequentialaccess',
            fromField: ''
          },
          {
            toField: 'u_properties_oid',
            fromField: 'className:oid'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      },
      {
        nodeName: 'DiskDrive',
        apiLink: '/api/now/import/x_iqu_iqsonar_inte_storage_disk_hadm',
        directMapping: [
          {
            toField: 'iq_ICN',
            fromField: 'className'
          },
          {
            toField: 'u_ido_oid',
            fromField: 'className:oid'
          },
          {
            toField: 'u_ido_cn',
            fromField: 'className'
          },
          {
            toField: 'u_ido_orgoid',
            fromField: 'orgOid'
          },
          {
            toField: 'u_properties_defaultblocksize',
            fromField: 'defaultBlockSize'
          },
          {
            toField: 'u_properties_disktype',
            fromField: 'diskType'
          },
          {
            toField: 'u_properties_interconnecttype',
            fromField: 'interconnectType'
          },
          {
            toField: 'u_properties_elementid',
            fromField: 'elementId'
          },
          {
            toField: 'u_properties_manufacturer',
            fromField: 'manufacturer'
          },
          {
            toField: 'u_properties_maxmediasize',
            fromField: 'maxmediasize'
          },
          {
            toField: 'u_properties_model',
            fromField: 'model'
          },
          {
            toField: 'u_properties_oid',
            fromField: 'className:oid'
          },
          {
            toField: 'u_properties_rpm',
            fromField: 'RPM'
          },
          {
            toField: 'u_properties_serialnumber',
            fromField: 'serialNumber'
          },
          {
            toField: 'u_properties_shortdescr',
            fromField: 'shortDescr'
          },
          {
            toField: 'u_properties_systemid',
            fromField: 'systemId'
          }
        ],
        multiplyMapping: [],
        divideMapping: [],
        toBooleanMapping: [],
        toDateMapping: []
      }
    ],
    relationMappings: [
      {
        fromClassName: 'ComputerSystem',
        mappings: [
          {
            toClassName: 'ComputerSystem',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Virtualized by::Virtualizes'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'NetworkDevice',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Uses::Used By'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'NetworkPort',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Uses::Used By'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'FCPort',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Uses::Used By'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'RAIDGroup',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Uses::Used By'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'DiskDrive',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Uses::Used By'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'StorageDevice',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Uses::Used By'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'StoragePool',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Uses::Used By'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          }
        ]
      },
      {
        fromClassName: 'ProductInstance',
        mappings: [
          {
            toClassName: 'ComputerSystem',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Runs on::Runs'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          }
        ]
      },
      {
        fromClassName: 'Application',
        mappings: [
          {
            toClassName: 'ProductInstance',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Depends on::Used by'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          }
        ]
      },
      {
        fromClassName: 'Service',
        mappings: [
          {
            toClassName: 'Application',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Depends on::Used by'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          }
        ]
      },
      {
        fromClassName: 'NetworkPort',
        mappings: []
      },
      {
        fromClassName: 'NetworkDevice',
        mappings: []
      },
      {
        fromClassName: 'FCPort',
        mappings: []
      },
      {
        fromClassName: 'RAIDGroup',
        mappings: []
      },
      {
        fromClassName: 'DiskDrive',
        mappings: []
      },
      {
        fromClassName: 'StorageDevice',
        mappings: [
          {
            toClassName: 'StorageDevice',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'ComputerSystem',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Used by::Uses'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'StoragePool',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'DiskDrive',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'RAIDGroup',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'StorageVolume',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'FCPort',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          }
        ]
      },
      {
        fromClassName: 'StoragePool',
        mappings: [
          {
            toClassName: 'StoragePool',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'RAIDGroup',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'DiskDrive',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          }
        ]
      },
      {
        fromClassName: 'StorageVolume',
        mappings: [
          {
            toClassName: 'RAIDGroup',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'StoragePool',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          },
          {
            toClassName: 'DiskDrive',
            apiLink: '/api/now/import/x_iqu_iqsonar_inte_iquate_rel_storage_hadm',
            valueMapping: [
              {
                toField: 'reltype',
                value: 'Provided by::Provides'
              }
            ],
            directMapping: [
              {
                toField: 'u_childcorrelationid',
                fromField: 'downstreamNodeId'
              },
              {
                toField: 'u_parentcorrelationid',
                fromField: 'upstreamNodeId'
              }
            ]
          }
        ]
      }
    ]
  }
};

@Injectable()
export class SyncService {
  constructor(
    private toastrService: ToastrService,
    private authService: AuthService,
    private apiService: ApiService,
    private webSocketService: WebSocketService
  ) {}

  public connectSyncWebSocket(): Subject<WebSocketMessage> {
    const syncWebSocketUrl = `${environment.webSocket.syncSystemBase}/notification/?itscape-api-key=${this.authService.getToken()}`;
    return <Subject<WebSocketMessage>>this.webSocketService
      .connect('sync', syncWebSocketUrl, () => { }, () => { })
      .map((response: MessageEvent): WebSocketMessage => {
        const data = JSON.parse(response.data);
        return { ...data };
      });
  }

  public disconnectSyncWebSocket(): void {
    this.webSocketService.disconnect('sync');
  }

  public getSyncSystems(): Observable<GetSyncSystemsAPIResult> {
    const uri = `sync`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('GET', uri).share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public getSyncSystem(systemName: string): Observable<GetSyncSystemAPIResult> {
    const uri = `sync/system/${systemName}`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('GET', uri)
      .map((apiResult: SyncSystem[]) => (apiResult[0]))
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public getSyncSystemHealth(systemName: string, timeframe: string): Observable<GetSyncSystemHealthAPIResult> {
    const uri = `sync/system-log/${systemName}/health`;
    const params = { timeframe };
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('GET', uri, params).share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public getSyncSystemsIntegrations(timeframe: string): Observable<GetSyncSystemsIntegrationsAPIResult> {
    return this.getSyncSystems().concatMap((syncSystems: SyncSystem[]) => {
      const data$ = Observable.zip(...syncSystems.map((syncSystem: SyncSystem) => {
        return this.getSyncSystemHealth(syncSystem.syncSystem.name, timeframe)
          .map((syncSystemHealth: SyncSystemHealth) => (Coercer.syncSystemIntegration(syncSystem, syncSystemHealth)));
      }));
      return data$.map((data: SyncSystemIntegration[]) => ({
        data,
        total: data.length
      }));
    }).share();
  }

  public getSyncSystemIntegration(systemName: string, timeframe: string): Observable<GetSyncSystemIntegrationAPIResult> {
    const syncSystem$ = this.getSyncSystem(systemName);
    const syncSystemHealth$ = this.getSyncSystemHealth(systemName, timeframe);

    return Observable.zip(syncSystem$, syncSystemHealth$,
      (syncSystem: SyncSystem, syncSystemHealth: SyncSystemHealth) => (Coercer.syncSystemIntegration(syncSystem, syncSystemHealth)));
  }

  public getSyncSystemLogs(systemName: string, searchParams: SyncSystemLogSearchParams): Observable<GetSyncSystemLogsAPIResult> {
    const uri = `sync/system-log/${systemName}`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('GET', uri, searchParams).share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public createSyncSystem(payload: SyncSystemBody): Observable<APIResult<any>> {
    const uri = `sync/system`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('POST', uri, payload)
      .do((operationResult: APIResult<any>) => this.toastrService.show(null, { success: true, ...operationResult }, 5000, false))
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public updateSyncSystem(payload: SyncSystemBody): Observable<APIResult<any>> {
    const uri = `sync/system`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('PUT', uri, payload)
      .do((operationResult: APIResult<any>) => this.toastrService.show(null, { success: true, ...operationResult }, 5000, false))
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public testSyncSystem(payload: SyncSystemBody): Observable<APIResult<any>> {
    const uri = `sync/test`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('POST', uri, payload)
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public initSyncSystem(systemName: string): Observable<APIResult<any>> {
    const uri = `sync/system/${systemName}/init`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('POST', uri, {})
      .do((operationResult: APIResult<any>) => this.toastrService.show(null, { success: true, ...operationResult }, 5000, false))
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public startSyncSystem(systemName: string): Observable<APIResult<any>> {
    const uri = `sync/system/${systemName}/start`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('POST', uri, {})
      .do((operationResult: APIResult<any>) => this.toastrService.show(null, { success: true, ...operationResult }, 5000, false))
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public stopSyncSystem(systemName: string): Observable<APIResult<any>> {
    const uri = `sync/system/${systemName}/stop`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('POST', uri, {})
      .do((operationResult: APIResult<any>) => this.toastrService.show(null, { success: true, ...operationResult }, 5000, false))
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public wipeSyncSystem(systemName: string): Observable<APIResult<any>> {
    const uri = `sync/system/${systemName}/wipe`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('POST', uri, {})
      .do((operationResult: APIResult<any>) => this.toastrService.show(null, { success: true, ...operationResult }, 5000, false))
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public deleteSyncSystem(systemName: string): Observable<APIResult<any>> {
    const uri = `sync/system/${systemName}`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('DELETE', uri)
      .do((operationResult: APIResult<any>) => this.toastrService.show(null, { success: true, ...operationResult }, 5000, false))
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

}

export interface SyncSystemBody {
  name: string;
  host: string;
  port: number;
  wipeUrl: string;
  syncUrl: string;
  login: {
    path: string;
    user: string;
    password: string;
    confirmPassword?: string;
    org: string;
  };
  systemType: string;
  relationsFilter: {
    type: string;
    classes: any[];
  };
  nodeFilter: {
    type: string;
    classes: any[];
  };
  mappings: {
    nodeMappings: any[];
    relationMappings: any[];
  };
}

export interface SyncSystem {
  syncSystem: SyncSystemBody;
  status?: string;
  logLevel: string;
}

export interface SyncSystemHealth {
  durationHealth: {
    avgSync: number;
    maxSync: number;
  };
  successCount: number;
  failCount: number;
  lastSuccessTimestamp: number;
  lastErrorTimestamp: number;
}

export interface SyncSystemIntegration {
  result: {
    name: string;
    type: string;
    successCount: number;
    failCount: number;
    successFailSummary: string;
    lastSuccess: number;
    lastError: number;
    sync: string;
  };
  syncSystem: SyncSystem;
  syncSystemHealth: SyncSystemHealth;
}

export interface SyncSystemLog {
  result: {
    timestamp: number;
    tenantId: string;
    tenantName: string;
    connectorId: string;
    connectorName: string;
    seedCiId: string;
    className: string;
    ciType: string;
    operation: string;
    targetCiId: string;
    syncStatus: string;
    syncDuration: number;
    errorCode: number;
    errorInfo: string;
    seedCI: any;
    mappedCI: {
      iq_ICN: string,
      u_correlationid: string,
      u_cpu_name: string,
      u_cpumanufacturer: string,
      u_dns_domain: string,
      u_ipaddress: string,
      u_is_virtual: boolean,
      u_lastseendate: string,
      u_location: string,
      u_name: string,
      u_operating_system: string,
      u_os_version: string,
      u_product: string
    },
    targetCI: any;
  };
  highlight: any;
}

export interface SyncSystemLogSearchParams {
  from?: number;
  pageSize?: number;
  fq?: string;
  orderBy?: string;
  orderDir?: string;
}

class Coercer {

  public static syncSystemIntegration(syncSystem: SyncSystem, syncSystemHealth: SyncSystemHealth): SyncSystemIntegration {
    return <SyncSystemIntegration>{
      result: {
        name: syncSystem.syncSystem.name,
        type: syncSystem.syncSystem.systemType,
        successCount: syncSystemHealth.successCount,
        failCount: syncSystemHealth.failCount,
        successFailSummary: `${syncSystemHealth.successCount}/${syncSystemHealth.failCount}`,
        lastSuccess: syncSystemHealth.lastSuccessTimestamp,
        lastError: syncSystemHealth.lastErrorTimestamp,
        sync: syncSystem.status
      },
      syncSystem,
      syncSystemHealth
    };
  }

}

export type SyncSystemLogTypeIcon = 'Default' | 'Relation' | 'Node';

export class Transforms {

  public static syncSystemLogTypeIconTransform(i: number, row: SyncSystemLog): SyncSystemLogTypeIcon {
    switch (row.result.ciType) {
      case 'Relation':
        return 'Relation';
      case 'Node':
        return 'Node';
      default:
        return 'Default';
    }
  }

}
