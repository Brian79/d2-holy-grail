import * as React from "react";
import Tabs from "@material-ui/core/Tabs/Tabs";
import AppBar from "@material-ui/core/AppBar/AppBar";
import Tab from "@material-ui/core/Tab/Tab";
import Typography from "@material-ui/core/Typography/Typography";
import { DataRenderer, ILevels } from "./dataRenderer/DataRenderer";
import { GrailManager } from "./GrailManager";
import { GrailMode } from "./GrailMode";
import { StatisticsTable } from "./StatisticsTable";
import { FilterRenderMode, IFilterResult } from "./GrailFilters";
import { ITabRendererProps } from "./TabRenderer";
import styled from "../../TypedStyledComponents";

export interface ITabRendererProps {
  allData: any;
  filterResult: IFilterResult;
}

interface ITabRendererState {
  activeTab: TabType;
  hasActiveSearch: boolean;
}

enum TabType {
  Statistics,
  UniqueArmor,
  UniqueWeapons,
  UniqueOther,
  Sets,
  SearchResults,
  Runewords
}

const runewordLevels: ILevels = { variantLevel: 4, level: 1 };

export class TabRenderer extends React.Component<ITabRendererProps, ITabRendererState> {
  public constructor(props: ITabRendererProps) {
    super(props);
    this.state = {
      activeTab: TabType.Statistics,
      hasActiveSearch: this.renderAsSearchResult
    };
  }

  public static getDerivedStateFromProps(props: ITabRendererProps, state: ITabRendererState) {
    const renderAsSearchResult = TabRenderer.shouldRenderAsSearchResult(props);
    if (renderAsSearchResult && !state.hasActiveSearch) {
      state.activeTab = TabType.SearchResults;
    } else if (!renderAsSearchResult && state.hasActiveSearch) {
      state.activeTab = TabType.Statistics;
    }
    state.hasActiveSearch = renderAsSearchResult;

    return state;
  }

  public render() {
    return (
      <RootContainer>
        <AppBar position="sticky">
          <Tabs value={this.state.activeTab} onChange={this.handleChange} centered={true}>
            <Tab label="Statistics" value={TabType.Statistics} />
            {!this.renderAsSearchResult && TabRenderer.getCategoryTabs()}
            {this.renderAsSearchResult && <Tab label="Search Results" value={TabType.SearchResults} />}
          </Tabs>
        </AppBar>
        <TabContainer>{this.getData()}</TabContainer>
      </RootContainer>
    );
  }

  private get renderAsSearchResult(): boolean {
    return TabRenderer.shouldRenderAsSearchResult(this.props);
  }

  private static shouldRenderAsSearchResult(props: ITabRendererProps): boolean {
    return props.filterResult && props.filterResult.renderMode === FilterRenderMode.Search;
  }

  private get dataToRender(): any {
    return !this.props.filterResult ? this.props.allData : this.props.filterResult.data;
  }

  private handleChange = (event: any, nextTab: TabType) => {
    this.setState({ activeTab: nextTab });
  };

  private static getCategoryTabs() {
    switch (GrailManager.current.grailMode) {
      case GrailMode.Eth:
        return [
          <Tab label="Unique Armor" key="tabUniqueArmor" value={TabType.UniqueArmor} />,
          <Tab label="Unique Weapons" key="tabUniqueWeapons" value={TabType.UniqueWeapons} />,
          <Tab label="Unique Other" key="tabUniqueOther" value={TabType.UniqueOther} />
        ];
      case GrailMode.Runeword:
        return [<Tab label="Runewords" key="tabRunewords" value={TabType.Runewords} />];
      default:
        return [
          <Tab label="Unique Armor" key="tabUniqueArmor" value={TabType.UniqueArmor} />,
          <Tab label="Unique Weapons" key="tabUniqueWeapons" value={TabType.UniqueWeapons} />,
          <Tab label="Unique Other" key="tabUniqueOther" value={TabType.UniqueOther} />,
          <Tab label="Sets" key="tabSets" value={TabType.Sets} />
        ];
    }
  }

  private getData() {
    switch (this.state.activeTab) {
      case TabType.SearchResults:
        return (
          <DataRenderer
            data={this.dataToRender}
            modifyLevels={this.modifyLevelsForSearch}
            levels={TabRenderer.getLevelsForSearch()}
          />
        );
      case TabType.UniqueArmor:
        return (
          <DataRenderer
            data={this.dataToRender.uniques.armor}
            levels={{ variantLevel: 2 }}
            ancestorKeys={["Uniques", "Armor"]}
          />
        );
      case TabType.UniqueWeapons:
        return (
          <DataRenderer
            data={this.dataToRender.uniques.weapons}
            levels={{ variantLevel: 2 }}
            ancestorKeys={["Uniques", "Weapons"]}
          />
        );
      case TabType.UniqueOther:
        return (
          <DataRenderer
            data={this.dataToRender.uniques.other}
            levels={{ variantLevel: 2 }}
            ancestorKeys={["Uniques", "Other"]}
          />
        );
      case TabType.Sets:
        return (
          <DataRenderer data={this.dataToRender.sets} levels={{ variantLevel: 3, level: 1 }} ancestorKeys={["Sets"]} />
        );
      case TabType.Runewords:
        return <DataRenderer data={this.dataToRender} levels={runewordLevels} />;
      default:
        return <StatisticsTable data={this.dataToRender} />;
    }
  }

  private modifyLevelsForSearch = (nextLevels: ILevels, key: string) => {
    if (key === "uniques") {
      nextLevels.level += 1;
    } else if (key === "sets") {
      nextLevels.level += 1;
      nextLevels.variantLevel += 2;
    }
    return nextLevels;
  };

  private static getLevelsForSearch(): ILevels {
    if (GrailManager.current.grailMode !== GrailMode.Runeword) {
      return null;
    }

    return runewordLevels;
  }
}

const TabContainer: React.FunctionComponent<{}> = props => {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
};

const RootContainer = styled.div`
  background-color: ${p => p.theme.palette.background.paper};
`;
