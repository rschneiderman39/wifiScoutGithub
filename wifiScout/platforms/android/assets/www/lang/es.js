if (typeof languages === 'undefined') {
  languages = {};
}

languages['es'] = {
  viewTitles: {
    APTable: 'Puntos de Acceso',
    channelGraph: 'Utilization de Canales',
    channelTable: 'Canales',
    settings: 'Configuracion',
    signalStrength: 'Fuerza de Senal',
    timeGraph: 'Grafico'
  },
  channelTable : {
    label2_4: '2.4 Ghz',
    label5: '5 Ghz',
    labelX: 'Canal',
    labelY: 'Ocupantes',
    tour: {
      intro: "This view displays the number of access points on each"
        + " channel in the 2.4 and 5.0Ghz frequency ranges. A high number"
        + " of access points on one channel can be an indicator of"
        + " congestion.",

      band2_4: "This section represents the 2.4 Ghz frequency band. While"
        + " offering a greater range than the 5 Ghz band, the 2.4 Ghz band"
        + " only has 3 non-overlapping channels, making it more prone to"
        + " interference.",

      band5: "This section represents the 5 Ghz frequency band. It offers"
        + " 23 non-overlapping channels, although, not all of these are"
        + " available everywhere.  If a channel is greyed out,"
        + " unauthorized use may be restricted in your region. "
    }
  },
  APTable : {
    sortSSID: 'SSID',
    sortMAC: 'Direccion MAC',
    sortManufacturer: 'Vendedor',
    sortChannel: 'Canal',
    sortLevel: 'Nivel (dBm)',
    sortCapabilities: 'Capacidades',
    tour: {
      intro: "This view displays all available information about all"
        + " access points visible to your device.",

      level: "The signal strength of an access point is measured in"
        + " decibel milliwatts (dBm). dBm is recorded on a logarithmic"
        + " scale - every increase of ~3dBm is equivalent to doubling the"
        + " power of the signal.  Because WiFi signals are relatively low"
        + " in energy, the measured dBm is typically a negative value,"
        + " with a smaller negative value representing a stronger signal.",

      sorting: "Tap on any of the table headers to sort the table by that"
        + " field.",

      channel: "An access point's channel number represents the"
        + " frequency range it's using.  Channels 1-14 belong to the 2.4"
        + " Ghz band, while channels 34-165 belong to the 5 Ghz band.",

      capabilities: "This field lists the networking and security"
        + " capabilities of a given access point. Wireless networks use"
        + " three common security protocols: WEP, WPA, and WPA2. WEP is no"
        + " longer considered secure - its use should be avoided.  WPA is"
        + " far better than WEP, but not as robust as WPA2, which should"
        + " be used whenever possible.  Another protocol supported by some"
        + " access points is WPS, which can be used to automate the setup"
        + " process. After setup, however, WPS should be disabled.",

      filter: "The filter button allows you to search for, select, or"
        + " eliminate certain access points that are displayed in the"
        + " table."
    }
  },
  timeGraph: {
    legendHeader: 'Selecciona un punto de acceso para destacarlo:',
    axisLabel: 'Nivel (dBm)',
    tour: {
      graph: "This interactive graph displays the measured signal strength"
        + " of each access point over time.",

      list: "Select an access point on the list to highlight it on the"
        + " graph.",

      filter: "The filter button allows you to search for, select, or"
        + " eliminate certain access points that are displayed in the"
        + " graph.",
    }
  },
    signalStrength: {
    listHeader: 'Selecciona un punto de acceso para ver la fuerza de su senal:',
    selectedAPHeader: 'AP Seleccionado:',
    minLevel: 'Nivel Minimo',
    currentLevel: 'Nivel Actual',
    maxLevel: 'Nivel Maximo',
    tour: {
      intro: "This view provides a live signal strength reading for a"
        + " selected access point, as well as maximum and minimum hold"
        + " information.",

      minLevel: "This box displays the weakest measured signal strength"
        + " since the access point was selected.",

      maxLevel: "This box displays the strongest measured signal strength"
        + " since the access point was selected."
    }
  },
  channelGraph : {
    label2_4: '2.4 Ghz',
    label5: '5 Ghz',
    labelX: 'Canal',
    labelY: 'Nivel (dBm)',
    tour: {
      intro: "This view displays both the channel utilization and signal"
        + " strength of each access point. Due constraints imposed by"
        + " device manufacturers, this application is unable to detect"
        + " anything other than a device's primary 20 mHz wide channel -"
        + " any channels wider than 20 Mhz are not recognized as such.",

      band2_4: "This section represents the 2.4 Ghz frequency band. While"
        + " offering a greater range than the 5 Ghz band, the 2.4 Ghz band"
        + " only has 3 non-overlapping channels, making it more prone to"
        + " interference.",

      band5: "This section represents the 5 Ghz frequency band. It offers"
        + " 23 non-overlapping channels, although, not all of these are"
        + " available everywhere.  If a channel is greyed out,"
        + "  unauthorized use may be restricted or not allowed in your"
        + " region. ",

      filter: "The filter button allows you to search for, select, or"
        + " eliminate certain access points that are displayed in the"
        + " graph.",
    }
  },
  filterModal : {
  	title: 'Seleccion',
  	searchBar: 'Buscar por SSID o MAC:',
  	selectAll: 'Selectar Todo',
  	deselectAll: 'Anular Seleccion'
  },
  settings: {
    startingViewHeader: 'Vista Inicial',
    startingViewDescription: 'La vista inicial de la applicacion.',
    globalAccessPointSelectionHeader: 'Seleccion',
    globalAccessPointSelectionDescription: 'Global: Todas las vistas comparten un seleccion. Local: Cada vista tiene seleccion propia.',
    globalAccessPointSelectionTrue: 'Global',
    globalAccessPointSelectionFalse: 'Local',
    detectHiddenHeader: 'Puntos de Acceso Escondido',
    detectHiddenDescription: 'Detectar o ignorar puntos de aceso escondido.',
    detectHiddenTrue: 'Detectar',
    detectHiddenFalse: 'Ignorar',
  }
};
