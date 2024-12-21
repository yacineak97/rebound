package config

import (
	"os"

	"gopkg.in/yaml.v2"
	// "encoding/json" // Uncomment for JSON parsing
)

func LoadConfig(filePath string) (map[string]interface{}, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var config map[string]interface{}

	// For YAML
	decoder := yaml.NewDecoder(file)
	err = decoder.Decode(&config)
	if err != nil {
		return nil, err
	}

	// For JSON (Uncomment if you prefer JSON format)
	// decoder := json.NewDecoder(file)
	// err = decoder.Decode(&config)
	// if err != nil {
	//     return nil, err
	// }

	return config, nil
}
